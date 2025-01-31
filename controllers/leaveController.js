const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllLeaveRequests = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role === "Lead") {
      // Fetch the lead's department
      const lead = await prisma.employee.findUnique({
        where: { id: userId },
        include: { department: true },
      });

      if (!lead || !lead.department) {
        return res
          .status(403)
          .json({ message: "You do not have access to leave requests." });
      }

    
      const leaveRequests = await prisma.leave.findMany({
        where: {
          employee: {
            departmentId: lead.department.id,
          },
          status: "Pending", // Only show pending requests to Lead
        },
        include: {
          employee: {
            include: {
              position: true,
              department: true,
            },
          },
        },
      });

      if (leaveRequests.length === 0) {
        return res
          .status(404)
          .json({ message: "No leave requests found for your department" });
      }

      return res.status(200).json(leaveRequests);
    }

    // For HR role, fetch all Accepted leave requests that need final approval
    if (role === "HR") {
      const leaveRequests = await prisma.leave.findMany({
        where: {
          status: { in: ["Accepted", "Rejected"] }, // Show accepted requests to HR for final approval
        },
        include: {
          employee: {
            include: {
              position: true,
              department: true,
            },
          },
        },
      });

      if (leaveRequests.length === 0) {
        return res
          .status(404)
          .json({ message: "No pending leave requests found for HR approval" });
      }

      return res.status(200).json(leaveRequests);
    }

    // If role is neither Lead nor HR
    return res.status(403).json({ message: "Unauthorized access" });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ message: "Error fetching leave requests" });
  }
};



const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, firstName, lastName } = req.body;

    if (!leaveType || !startDate || !endDate || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const employeeId = req.user.id;

    // Fetch the requesting employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Verify name matches employee record
    if (employee.firstName !== firstName || employee.lastName !== lastName) {
      return res.status(400).json({
        message: "Name does not match the employee record.",
      });
    }

    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
    const currentYear = currentDate.getFullYear();

    // Fetch all leave requests for the current month
    const leaveRequestsThisMonth = await prisma.leave.findMany({
      where: {
        employeeId,
        startDate: {
          gte: new Date(`${currentYear}-${currentMonth}-01`), // Start of the month
          lt: new Date(`${currentYear}-${currentMonth + 1}-01`), // Start of the next month
        },
      },
    });

    // Check if the employee has already taken 3 leaves this month
    if (leaveRequestsThisMonth.length >= 3) {
      return res.status(400).json({
        message: "You have already used all 3 leaves this month. Use the Special Leave.",
      });
    }

    // Check if the employee has exceeded their leave limit
    if (employee.totalLeave <= 0) {
      return res
        .status(400)
        .json({ message: "You have 0 limit of leave remaining. Use the Special Leave" });
    }

    // Check for overlapping leave requests
    const existingLeaveRequest = await prisma.leave.findFirst({
      where: {
        employeeId,
        startDate: { gte: new Date(startDate) },
        endDate: { lte: new Date(endDate) },
      },
    });

    if (existingLeaveRequest) {
      return res.status(400).json({
        message: `You already have a leave request for the dates ${startDate} to ${endDate}`,
      });
    }

    // Check if a lead exists in the same department
    const lead = await prisma.employee.findFirst({
      where: {
        departmentId: employee.departmentId,
        role: "Lead",
      },
    });

    // Create the leave request
    const leave = await prisma.leave.create({
      data: {
        employeeId,
        firstName,
        lastName,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "Pending",
      },
    });

    // Decrement the employee's total leave count
    await prisma.employee.update({
      where: { id: employeeId },
      data: { totalLeave: employee.totalLeave - 1 },
    });

    // Notify HR and Lead
    const responseMessage = `Leave request created successfully for ${employee.firstName} ${employee.lastName}`;
    const notifications = [];

    notifications.push("HR has been notified.");

    if (lead) {
      notifications.push(
        `The lead (${lead.firstName} ${lead.lastName}) in your department has also been notified.`
      );
    }

    res.status(201).json({
      message: responseMessage,
      leave,
      notifications,
    });
  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(500).json({ message: "Error creating leave request" });
  }
};



const updateLeaveStatus = async (req, res) => {
  const { leaveId } = req.params; 
  const { status } = req.body; 
  const { role } = req.user; 

  try {
    // Find the leave request by ID
    const leaveRequest = await prisma.leave.findUnique({
      where: { id: parseInt(leaveId) },
    });

    // If leave request not found, return an error
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    // If Lead has already rejected the leave, HR cannot change the status
    if (leaveRequest.status === "Rejected") {
      return res.status(403).json({
        message:
          "Leave request has been rejected by the Lead. HR cannot change it.",
      });
    }

    // Logic for Lead to update leave status
    if (role === "Lead") {
      if (status === "Accepted" || status === "Rejected") {
        await prisma.leave.update({
          where: { id: parseInt(leaveId) },
          data: { status },
        });
        return res.status(200).json({
          message: `Leave request has been ${status} by the Lead.`,
        });
      } else {
        return res.status(400).json({
          message:
            "Invalid status. Lead can only set status to Accepted or Rejected.",
        });
      }
    }

    // Logic for HR to update leave status
    if (role === "HR") {
      // HR can only act on leave requests if the Lead has accepted them
      if (leaveRequest.status === "Accepted") {
        if (status === "Accepted" || status === "Rejected") {
          await prisma.leave.update({
            where: { id: parseInt(leaveId) },
            data: { status },
          });
          return res.status(200).json({
            message: `Leave request has been ${status} by HR.`,
          });
        } else {
          return res.status(400).json({
            message:
              "Invalid status. HR can only set status to Accepted or Rejected.",
          });
        }
      } else {
        return res.status(403).json({
          message:
            "HR cannot change the status of a leave request unless it has been accepted by the Lead.",
        });
      }
    }

    // If the role is not Lead or HR, deny access
    return res
      .status(403)
      .json({ message: "You are not authorized to update the leave status." });
  } catch (error) {
    console.error("Error updating leave status:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the leave status." });
  }
};


const getLeaveReport = async (req, res) => {
  try {
    let { id: employeeId } = req.user;

    let employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        leave: true,
        position: true,
        department: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let leaveTaken = employee.leave.filter(
      (l) => l.status.toLowerCase() === "accepted"
    );
    if(leaveTaken.length >3){

      return res.status(404).json({ message: "Leave limit exceeded" });
    }
    let leaveBalance = employee.totalLeave - leaveTaken.length;
    
    
    res.status(200).json({
      leaveBalance: leaveBalance,
      leaveTaken: leaveTaken.length,
      leaveLeft: leaveBalance,
      position: employee.position,
      department: employee.department,
      leaves: employee.leave,
    });
  } catch (error) {
    console.error("Error fetching leave report:", error);
    res.status(500).json({ message: "Error fetching leave report" });
  }
};
const createSpecialLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const { id: employeeId } = req.user;

    
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required for special leave" });
    }

    // Find the employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { 
        leave: true,
        department: true 
      }
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

   
    const acceptedLeaves = employee.leave.filter(
      (l) => l.status.toLowerCase() === "accepted"
    );

    
    if (acceptedLeaves.length < employee.totalLeave) {
      return res.status(400).json({ 
        message: "Special leave can only be requested after exhausting regular leaves" 
      });
    }

    // Ensure leaveType is SPECIAL_LEAVE
    if (leaveType !== "SPECIAL_LEAVE") {
      return res.status(400).json({ 
        message: "Leave type must be SPECIAL_LEAVE" 
      });
    }

    // Check for existing special leave requests
    const existingSpecialLeave = await prisma.leave.findFirst({
      where: {
        employeeId,
        leaveType: "SPECIAL_LEAVE",
        status: { not: "Rejected" }
      }
    });

    if (existingSpecialLeave) {
      return res.status(400).json({ 
        message: "You already have a pending or accepted special leave request" 
      });
    }

   
    const specialLeave = await prisma.leave.create({
      data: {
        employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        leaveType: "SPECIAL_LEAVE",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "Pending",
        specialLeaveReason: reason
      }
    });

    res.status(201).json({
      message: "Special leave request created successfully",
      leave: specialLeave
    });

  } catch (error) {
    console.error("Error creating special leave request:", error);
    res.status(500).json({ message: "Error processing special leave request" });
  }
};
const getSpecialLeaveRequests = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

   
    if (role !== "Lead" && role !== "HR") {
      return res.status(403).json({ message: "Unauthorized to view special leave requests" });
    }

    let specialLeaveRequests;

    if (role === "Lead") {
      
      const lead = await prisma.employee.findUnique({
        where: { id: userId },
        include: { department: true }
      });

      specialLeaveRequests = await prisma.leave.findMany({
        where: {
          leaveType: "SPECIAL_LEAVE",
          status: "Pending",
          employee: {
            departmentId: lead.department.id
          }
        },
        include: {
          employee: {
            include: {
              department: true,
              position: true
            }
          }
        }
      });
    } else {
    
      specialLeaveRequests = await prisma.leave.findMany({
        where: {
          leaveType: "SPECIAL_LEAVE",
          status: "Pending"
        },
        include: {
          employee: {
            include: {
              department: true,
              position: true
            }
          }
        }
      });
    }

    if (specialLeaveRequests.length === 0) {
      return res.status(404).json({ 
        message: "No special leave requests found" 
      });
    }

    res.status(200).json(specialLeaveRequests);
  } catch (error) {
    console.error("Error fetching special leave requests:", error);
    res.status(500).json({ message: "Error retrieving special leave requests" });
  }
};
module.exports = { createLeaveRequest, getAllLeaveRequests, updateLeaveStatus,getLeaveReport,createSpecialLeaveRequest,getSpecialLeaveRequests };
