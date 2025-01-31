const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Get all expenses
const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log("Received startDate:", startDate);
    console.log("Received endDate:", endDate);

    const whereClause = {};

    if (startDate && endDate) {
      // Convert startDate and endDate to UTC timestamps
      const startOfDay = new Date(`${startDate}T00:00:00.000Z`); // Start of the day in UTC
      const endOfDay = new Date(`${endDate}T23:59:59.999Z`); // End of the day in UTC

      console.log("Adjusted start date:", startOfDay);
      console.log("Adjusted end date:", endOfDay);

      whereClause.date = {
        gte: startOfDay, // Greater than or equal to the start of the day
        lte: endOfDay,   // Less than or equal to the end of the day
      };
    }

    // Fetch expenses from the database within the date range
    const expenses = await prisma.expenses.findMany({
      where: whereClause,
      include: { category: true }, // Ensure category details are included
    });

    console.log("Found expenses:", expenses.length);

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: error.message });
  }
};



// Get total expenses by category for the current month
const getMonthlyExpensesByCategory = async (req, res) => {
  try {
    // Extract startDate and endDate from query parameters
    const { startDate, endDate } = req.query;

    // Validate the date inputs
    let start, end;

    if (startDate && endDate) {
      // If both startDate and endDate are provided, use them
      start = new Date(`${startDate}T00:00:00.000Z`); // Start of the day in UTC
      end = new Date(`${endDate}T23:59:59.999Z`); // End of the day in UTC
    } else if (startDate) {
      // If only startDate is provided, set endDate to the end of the day
      start = new Date(`${startDate}T00:00:00.000Z`); // Start of the day in UTC
      end = new Date(`${startDate}T23:59:59.999Z`); // End of the day in UTC
    } else if (endDate) {
      // If only endDate is provided, set startDate to the beginning of the month
      start = new Date(`${endDate}T00:00:00.000Z`);
      start.setDate(1); // First day of the month
      end = new Date(`${endDate}T23:59:59.999Z`); // End of the day in UTC
    } else {
      // If neither startDate nor endDate is provided, default to the current month
      start = new Date();
      start.setDate(1); // First day of the month
      start.setHours(0, 0, 0, 0); // Start of the day
      end = new Date();
      end.setMonth(end.getMonth() + 1); // First day of the next month
      end.setHours(0, 0, 0, 0); // Start of the day
    }

    // Fetch expenses grouped by category within the date range
    const expenses = await prisma.expenses.groupBy({
      by: ['categoryId'],
      where: {
        date: {
          gte: start, // Greater than or equal to start date
          lte: end,   // Less than or equal to end date
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate total monthly expenses
    const totalMonthlyExpenses = expenses.reduce((total, category) => {
      return total + (category._sum.amount || 0);
    }, 0);

    res.json({
      totalMonthly: totalMonthlyExpenses,
      byCategory: expenses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new expense
const addExpense = async (req, res) => {
  try {
    const { categoryId, amount, expenseType, description } = req.body;

    const categoryExists = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid categoryId. Expense category not found." });
    }

    const currentDate = new Date(); // Get the current date

    const newExpense = await prisma.expenses.create({
      data: {
        categoryId,
        amount,
        expenseType,
        date: currentDate, // Set the current date
        description,
      },
      include: {
        category: true, // Include the category details in the response
      },
    });

    // Format the response to include date, month, and year
    const response = {
      ...newExpense,
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      month: currentDate.toLocaleString('default', { month: 'long' }), // Full month name
      year: currentDate.getFullYear(), // Year
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getExpenseCategories = async (req, res) => {
    try {
      const categories = await prisma.expenseCategory.findMany();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  const addExpenseCategory = async (req, res) => {
    try {
      const { name, description } = req.body;
      
      // Ensure name is provided
      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }
  
      const newCategory = await prisma.expenseCategory.create({
        data: { name, description },
      });
  
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
module.exports = { getExpenses, getMonthlyExpensesByCategory, addExpense,getExpenseCategories,addExpenseCategory };
