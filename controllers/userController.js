const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.employee.findMany();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching users" });
  }
};

module.exports = {
  getAllUsers,
};
