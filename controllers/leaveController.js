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

      // Fetch leave requests for employees in the same department
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
          status: "Accepted", // Show accepted requests to HR for final approval
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
  const { leaveId } = req.params; // Extract leave ID from the request parameters
  const { status } = req.body; // Extract status from the request body
  const { role } = req.user; // Extract user role from the authenticated user object

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

module.exports = { createLeaveRequest, getAllLeaveRequests, updateLeaveStatus };
