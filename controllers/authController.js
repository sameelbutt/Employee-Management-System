const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const config = require("../config/config");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      address,
      bankAccount,
      password,
      phoneNumber,
      departmentId,
      positionId,
      salary,
      role,
    } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAutoApproved = role === "HR" || role === "ADMIN";
    const status = isAutoApproved ? "ACTIVE" : "PENDING";

    const newEmployee = await UserModel.createEmployee({
      firstName,
      lastName,
      address,
      bankAccount,
      email,
      password: hashedPassword,
      phoneNumber,
      departmentId,
      positionId,
      salary,
      role,
      hireDate: new Date(),
      status,
      approved: isAutoApproved,
    });

    const token = jwt.sign(
      {
        id: newEmployee.id,
        email: newEmployee.email,
        role: newEmployee.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.status(201).json({
      message: `Employee registered successfully${
        isAutoApproved ? "" : ". Awaiting HR approval."
      }`,
      token,
      employee: {
        id: newEmployee.id,
        email: newEmployee.email,
        role: newEmployee.role,
        status: newEmployee.status,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating employee account." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await UserModel.findByEmail(email);
    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!employee.approved) {
      return res.status(401).json({ message: "Employee is not approved yet." });
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: employee.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.json({
      message: "Login successful.",
      token,
      employee: {
        id: employee.id,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login process." });
  }
};

const addEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      address,
      bankAccount,
      password,
      phoneNumber,
      departmentId,
      positionId,
      salary,
      role,
    } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await UserModel.createEmployee({
      firstName,
      lastName,
      address,
      bankAccount,
      email,
      password: hashedPassword,
      phoneNumber,
      departmentId,
      positionId,
      salary,
      role,
      hireDate: new Date(),
      status: "ACTIVE",
    });

    res.status(201).json({
      message: "Employee added successfully.",
      employee: {
        id: newEmployee.id,
        email: newEmployee.email,
        role: newEmployee.role,
      },
    });
  } catch (error) {
    console.error("Add employee error:", error);
    res.status(500).json({ message: "Error adding employee." });
  }
};

const approveEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { approved } = req.body;
    const { role } = req.user;

    if (role !== "HR") {
      return res
        .status(403)
        .json({ message: "Only HR can approve/reject employees." });
    }

    const isApproved = approved === true;
    const employee = await UserModel.updateEmployeeApproval(
      employeeId,
      isApproved
    );

    res.status(200).json({
      message: `Employee has been ${isApproved ? "approved" : "rejected"}.`,
      employee,
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ message: "Error during approval process." });
  }
};
const getPendingApprovals = async (req, res) => {
  try {
    const { role } = req.user;

    
    if (!["Admin", "HR"].includes(role)) {
      return res.status(403).json({ message: "Access denied." });
    }

   
    const pendingEmployees = await prisma.employee.findMany({
      where: { approved: false },
    });

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
  signup,
  login,
  addEmployee,
  getPendingApprovals,
  approveEmployee,
};
