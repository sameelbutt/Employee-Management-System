const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

const createEmployee = async (employeeData) => {
  try {
    const departmentId = parseInt(employeeData.departmentId, 10);
    const positionId = parseInt(employeeData.positionId, 10);

    const departmentExists = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!departmentExists) {
      throw new Error(`Department with ID ${departmentId} does not exist.`);
    }

    const positionExists = await prisma.position.findUnique({
      where: { id: positionId },
    });
    if (!positionExists) {
      throw new Error(`Position with ID ${positionId} does not exist.`);
    }

    return await prisma.employee.create({
      data: {
        ...employeeData,
        departmentId: departmentId,
        positionId: positionId,
        address: employeeData.address,
        bankAccount: employeeData.bankAccount,
      },
    });
  } catch (error) {
    console.error("Error in createEmployee:", error);
    throw new Error("Error creating employee");
  }
};

const findByEmail = async (email) => {
  try {
    return await prisma.employee.findUnique({
      where: {
        email: email,
      },
    });
  } catch (error) {
    console.error("Error in findByEmail:", error);
    throw new Error("Error fetching employee by email");
  }
};

const validatePassword = async (inputPassword, storedPassword) => {
  try {
    return await bcrypt.compare(inputPassword, storedPassword);
  } catch (error) {
    console.error("Error in validatePassword:", error);
    throw new Error("Error validating password");
  }
};

const getAllEmployees = async () => {
  try {
    return await prisma.employee.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error in getAllEmployees:", error);
    throw new Error("Error fetching all employees");
  }
};

const updateEmployeeApproval = async (employeeId, approved) => {
  try {
    return await prisma.employee.update({
      where: { id: parseInt(employeeId, 10) },
      data: {
        approved: approved,
        status: approved ? "ACTIVE" : "PENDING",
      },
    });
  } catch (error) {
    console.error("Error in updateEmployeeApproval:", error);
    throw new Error("Error updating employee approval status");
  }
};
const getPendingApprovals = async (req, res) => {
  try {
    const { role } = req.user;

    // Only allow Admin and HR to fetch this data
    if (!["Admin", "HR"].includes(role)) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Fetch all employees where approval is pending
    const pendingEmployees = await UserModel.find({ approved: false });

    if (!pendingEmployees || pendingEmployees.length === 0) {
      return res.status(404).json({ message: "No pending approvals found." });
    }

    res.status(200).json(pendingEmployees);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ message: "Error fetching pending approvals." });
  }
};

module.exports = {
  createEmployee,
  findByEmail,
  validatePassword,
  getAllEmployees,
  updateEmployeeApproval,
  getPendingApprovals,
};
