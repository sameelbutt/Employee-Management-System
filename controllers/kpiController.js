const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

 const kpiController = {
  // Create new KPI template
  createTemplate: async (req, res) => {
    try {
      const { name, description, isAutomatic, startDate, endDate, criteria } = req.body;

      const template = await prisma.kPITemplate.create({
        data: {
          name,
          description,
          isAutomatic,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          kpiCriteria: {
            create: criteria.map(criterion => ({
              name: criterion.name,
              description: criterion.description,
              weightage: criterion.weightage
            }))
          }
        },
        include: {
          kpiCriteria: true
        }
      });

      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all KPI templates
  getTemplates: async (req, res) => {
    try {
      const templates = await prisma.kPITemplate.findMany({
        include: {
          kpiCriteria: true
        }
      });
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update KPI template
  updateTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, isAutomatic, isActive, startDate, endDate, criteria } = req.body;

      // First update the template
      const template = await prisma.kPITemplate.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          isAutomatic,
          isActive,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        }
      });

      // Update criteria if provided
      if (criteria) {
        // Delete existing criteria
        await prisma.kPICriteria.deleteMany({
          where: { templateId: parseInt(id) }
        });

        // Create new criteria
        await prisma.kPICriteria.createMany({
          data: criteria.map(criterion => ({
            ...criterion,
            templateId: parseInt(id)
          }))
        });
      }

      const updatedTemplate = await prisma.kPITemplate.findUnique({
        where: { id: parseInt(id) },
        include: { kpiCriteria: true }
      });

      res.json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
module.exports = { kpiController };