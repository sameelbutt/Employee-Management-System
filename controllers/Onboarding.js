const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createOnboarding = async (req, res) => {
  const { employeeId, startDate, endDate, tasks } = req.body;

  try {
    // Get lead's details (Assuming `req.user` contains the authenticated lead)
    const lead = await prisma.employee.findUnique({
      where: { id: req.user.id }, // Ensure authentication middleware adds `req.user`
      include: { department: true, position: true },
    });

    if (!lead) {
      return res.status(403).json({ error: "Unauthorized: Lead not found" });
    }

    // Get employee details
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId) },
      include: { department: true, position: true },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Ensure the employee is in the same department and position as the lead
    if (
      lead.department.id !== employee.department.id || // Different department
      lead.position.id !== employee.position.id // Different position
    ) {
      return res.status(403).json({
        error: "You can only assign tasks to employees in the same department and position.",
      });
    }

    // Create multiple onboarding tasks
    const onboarding = await prisma.onboarding.create({
      data: {
        employeeId: parseInt(employeeId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tasks: tasks, // Store array directly
      },
    });

    res.status(201).json(onboarding);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating onboarding record" });
  }
};




const getOnboardingByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get all onboarding records for the employee
    const onboarding = await prisma.onboarding.findMany({
      where: { employeeId: parseInt(employeeId) },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    if (onboarding.length === 0) {
      return res
        .status(404)
        .json({ error: "Onboarding not found for this employee." });
    }

    res.status(200).json(onboarding); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const updateOnboarding = async (req, res) => {
  const { employeeId } = req.params;
  const { startDate, endDate, tasks } = req.body;

  try {
    const onboarding = await prisma.onboarding.findFirst({
      where: { employeeId: parseInt(employeeId) },
    });

    if (!onboarding) {
      return res
        .status(404)
        .json({ error: "Onboarding not found for this employee." });
    }

    const updatedOnboarding = await prisma.onboarding.update({
      where: { id: onboarding.id },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tasks,
      },
    });

    res.status(200).json(updatedOnboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOnboarding = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const onboarding = await prisma.onboarding.findFirst({
      where: { employeeId: parseInt(employeeId) },
    });

    if (!onboarding) {
      return res.status(404).json({ error: "Onboarding record not found." });
    }

    await prisma.onboarding.delete({
      where: { id: onboarding.id },
    });

    res.status(200).json({ message: "Onboarding record deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOnboarding,
  getOnboardingByEmployee,
  updateOnboarding,
  deleteOnboarding,
};
