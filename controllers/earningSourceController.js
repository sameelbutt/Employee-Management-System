const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all earning sources
const getEarningSources = async (req, res) => {
  try {
    const sources = await prisma.earningSource.findMany();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new earning source
const addEarningSource = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newSource = await prisma.earningSource.create({
      data: { name, description },
    });

    res.status(201).json(newSource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getEarningSources, addEarningSource };
