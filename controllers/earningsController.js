const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all earnings
const getEarnings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
   

    const whereClause = {};
    if (startDate && endDate) {
      // Convert startDate and endDate to UTC timestamps
      const startOfDay = new Date(`${startDate}T00:00:00.000Z`); // Start of the day in UTC
      const endOfDay = new Date(`${endDate}T23:59:59.999Z`); // End of the day in UTC

      whereClause.date = {
        gte: startOfDay, // Greater than or equal to the start of the day
        lte: endOfDay,   // Less than or equal to the end of the day
      };
    }

    const earnings = await prisma.earnings.findMany({
      where: whereClause,
      include: { source: true },
    });

    res.json(earnings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
  // Get total earnings by source for the current month
  const getMonthlyEarningsBySource = async (req, res) => {
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
  
      // Fetch earnings grouped by source within the date range
      const earnings = await prisma.earnings.groupBy({
        by: ['sourceId'],
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
  
      // Calculate total monthly earnings
      const totalMonthlyEarnings = earnings.reduce((total, source) => {
        return total + (source._sum.amount || 0);
      }, 0);
  
      res.json({
        totalMonthly: totalMonthlyEarnings,
        bySource: earnings,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
  // Add a new earning
  const addEarning = async (req, res) => {
    try {
      const { sourceId, amount, earningType, description } = req.body;
  
      const sourceExists = await prisma.earningSource.findUnique({ where: { id: sourceId } });
      if (!sourceExists) {
        return res.status(400).json({ error: "Invalid sourceId. Earning source not found." });
      }
  
      const currentDate = new Date(); // Get the current date
  
      const newEarning = await prisma.earnings.create({
        data: {
          sourceId,
          amount,
          earningType,
          date: currentDate, // Set the current date
          description,
        },
        include: {
          source: true, // Include the source details in the response
        },
      });
  
      // Format the response to include date, month, and year
      const response = {
        ...newEarning,
        date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
        month: currentDate.toLocaleString('default', { month: 'long' }), // Full month name
        year: currentDate.getFullYear(), // Year
      };
  
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = { getEarnings, getMonthlyEarningsBySource, addEarning }