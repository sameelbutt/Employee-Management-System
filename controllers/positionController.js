const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getPositionsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const positions = await prisma.position.findMany({
      where: {
        departmentId: parseInt(departmentId),
      },
    });
    if (positions.length === 0) {
      return res
        .status(404)
        .json({ message: "No positions found for this department" });
    }
    res.json(positions);
  } catch (error) {
    console.error("Error in getPositionsByDepartment:", error);
    res.status(500).json({ message: "Error fetching positions" });
  }
};

const getAllPositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany();
    res.json(positions);
  } catch (error) {
    console.error("Error in getAllPositions:", error);
    res.status(500).json({ message: "Error fetching positions" });
  }
};

const createPosition = async (req, res) => {
  try {
    const { name, departmentId } = req.body;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(departmentId) },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const position = await prisma.position.create({
      data: {
        name,
        departmentId: parseInt(departmentId),
      },
    });
    res.status(201).json(position);
  } catch (error) {
    console.error("Error in createPosition:", error);
    res.status(500).json({ message: "Error creating position" });
  }
};

module.exports = {
  getPositionsByDepartment,
  getAllPositions,
  createPosition,
};
