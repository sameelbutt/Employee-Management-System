const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Fetch employees with optional filtering by departmentId, positionId, and role
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

    // Fetch employees based on the filter
    const employees = await prisma.employee.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    // Combine firstName and lastName into a single name field
    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`, // Combine first and last name
      email: emp.email,
      role: emp.role,
    }));

    // Return the filtered employees (empty array if no matches)
    return res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error("Error in getEmployees:", error);
    return res.status(500).json({ error: "Error fetching employees" });
  }
};

module.exports = {
  getEmployees,
};