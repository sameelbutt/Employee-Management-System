const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const departments = await prisma.department.createMany({
      data: [
        { id: 1, name: "Human Resources" },
        { id: 2, name: "Information Technology" },
        { id: 3, name: "Finance" },
        { id: 4, name: "Marketing" },
        { id: 5, name: "Operations" },
      ],
      skipDuplicates: true,
    });

    console.log(" Departments seeded:", departments);

    const positions = await prisma.position.createMany({
      data: [
        { id: 1, name: "HR Manager", departmentId: 1 },
        { id: 2, name: "HR Assistant", departmentId: 1 },
        { id: 3, name: "Software Engineer", departmentId: 2 },
        { id: 4, name: "Frontend Developer", departmentId: 2 },
        { id: 5, name: "Backend Developer", departmentId: 2 },
        { id: 6, name: "Financial Analyst", departmentId: 3 },
        { id: 7, name: "Accountant", departmentId: 3 },
        { id: 8, name: "Marketing Specialist", departmentId: 4 },
        { id: 9, name: "Social Media Manager", departmentId: 4 },
        { id: 10, name: "SEO Specialist", departmentId: 4 },
        { id: 11, name: "Operations Manager", departmentId: 5 },
        { id: 12, name: "Logistics Coordinator", departmentId: 5 },
        { id: 13, name: "Supply Chain Manager", departmentId: 5 },
      ],
      skipDuplicates: true,
    });

    console.log(" Positions seeded:", positions);
  } catch (error) {
    console.error(" Error seeding data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(" Error seeding data:", error);
  process.exit(1);
});
