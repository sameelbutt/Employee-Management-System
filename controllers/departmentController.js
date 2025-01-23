const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    console.error("Error in getAllDepartments:", error);
    res.status(500).json({ message: "Error fetching departments" });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(department);
  } catch (error) {
    console.error("Error in getDepartmentById:", error);
    res.status(500).json({ message: "Error fetching department" });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const department = await prisma.department.create({
      data: { name },
    });
    res.status(201).json(department);
  } catch (error) {
    console.error("Error in createDepartment:", error);
    res.status(500).json({ message: "Error creating department" });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
};
