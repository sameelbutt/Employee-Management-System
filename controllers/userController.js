const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Backend: Update the getEmployees function in your controller
const getEmployees = async (req, res) => {
  try {
    const { departmentId, positionId, role } = req.query;

    // Build the filter object dynamically
    const where = {};
    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }
    if (positionId) {
      where.positionId = parseInt(positionId);
    }
    if (role) {
      const rolesArray = role.split(",");
      where.role = { in: rolesArray };
    }

    // Fetch employees with all required fields
    const employees = await prisma.employee.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: true,
        hireDate: true,
        status: true,
        departmentId: true,
        positionId: true,
        salary: true,
        role: true,
        bankAccount: true
      },
    });

    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error in getEmployees:", error);
    return res.status(500).json({ error: "Error fetching employees" });
  }
};

module.exports = {
  getEmployees,
};