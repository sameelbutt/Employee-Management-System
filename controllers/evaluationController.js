
 const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
const evaluationController = {
    // Create new evaluation
  // Create new evaluation
// Create new evaluation
createEvaluation: async (req, res) => {
  try {
    const { employeeId, supervisorId, templateId, startDate, endDate } = req.body;

    // Create the evaluation
    const evaluation = await prisma.performanceEvaluation.create({
      data: {
        employeeId: parseInt(employeeId),
        supervisorId: parseInt(supervisorId),
        templateId: parseInt(templateId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'PENDING'
      }
    });

    // Create KPI evaluations for each criteria
    const template = await prisma.kPITemplate.findUnique({
      where: { id: parseInt(templateId) },
      include: { kpiCriteria: true }
    });

    await prisma.kPIEvaluation.createMany({
      data: template.kpiCriteria.map(criteria => ({
        criteriaId: criteria.id,
        evaluationId: evaluation.id
      }))
    });

    // Return a success response with a message for the supervisor
    res.status(201).json({
      evaluation,
      messageForSupervisor: `You have a new performance evaluation to review. Visit http://localhost:3000/supervisor/${supervisorId} to view it.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},
  // Get pending evaluations for the logged-in supervisor
  // Backend: Fetch pending evaluations for a supervisor
// Fetch pending evaluations for a supervisor
// Fetch pending evaluations for a supervisor
getPendingEvaluations: async (req, res) => {
  console.log('getPendingEvaluations called', req.query);
  try {
    const { supervisorId } = req.query;
    if (!supervisorId) {
      return res.status(400).json({ error: "Supervisor ID is required" });
    }

    const pendingEvaluations = await prisma.performanceEvaluation.findMany({
      where: {
        supervisorId: parseInt(supervisorId),
        status: "PENDING",
      },
      include: {
        employee: true,
        supervisor: true,
        template: {
          include: {
            kpiCriteria: true
          }
        },
        kpiEvaluations: {
          include: {
            criteria: true
          }
        }
      }
    });
    return res.status(200).json(pendingEvaluations);
  } catch (error) {
    console.error("Error fetching pending evaluations:", error);
    return res.status(500).json({ error: error.message });
  }
},

    // Submit supervisor evaluation
    submitSupervisorEvaluation: async (req, res) => {
      try {
        const { evaluationId } = req.params;
        const { ratings, comments } = req.body;
  
        // Update each KPI evaluation
        for (const rating of ratings) {
          await prisma.kPIEvaluation.update({
            where: {
              id: rating.evaluationId
            },
            data: {
              supervisorRating: rating.rating,
              comments: rating.comments
            }
          });
        }
  
        // Update the main evaluation
        const evaluation = await prisma.performanceEvaluation.update({
          where: { id: parseInt(evaluationId) },
          data: {
            status: 'HR_REVIEW',
            supervisorComments: comments
          }
        });
  
        res.json(evaluation);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  
    // Submit HR evaluation and calculate final score
    submitHREvaluation: async (req, res) => {
      try {
        const { evaluationId } = req.params;
        const { ratings, comments } = req.body;
  
        let totalScore = 0;
        let totalWeight = 0;
  
        // Update each KPI evaluation and calculate weighted score
        for (const rating of ratings) {
          const kpiEval = await prisma.kPIEvaluation.update({
            where: { id: rating.evaluationId },
            data: {
              hrRating: rating.rating
            },
            include: {
              criteria: true
            }
          });
  
          totalScore += (rating.rating * kpiEval.criteria.weightage);
          totalWeight += kpiEval.criteria.weightage;
        }
  
        // Calculate final score
        const finalScore = (totalScore / totalWeight) * 100;
  
        // Update the main evaluation
        const evaluation = await prisma.performanceEvaluation.update({
          where: { id: parseInt(evaluationId) },
          data: {
            status: 'COMPLETED',
            hrComments: comments,
            finalScore
          }
        });
  
        res.json(evaluation);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  
    // Get evaluation details
    getEvaluation: async (req, res) => {
      try {
        const { id } = req.params;
        const evaluation = await prisma.performanceEvaluation.findUnique({
          where: { id: parseInt(id) },
          include: {
            employee: true,
            supervisor: true,
            template: {
              include: {
                kpiCriteria: true
              }
            },
            kpiEvaluations: {
              include: {
                criteria: true
              }
            }
          }
        });
        
        if (!evaluation) {
          return res.status(404).json({ error: 'Evaluation not found' });
        }
  
        res.json(evaluation);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  
    // Get employee evaluations
    getEmployeeEvaluations: async (req, res) => {
      try {
        const { employeeId } = req.params;
        const evaluations = await prisma.performanceEvaluation.findMany({
          where: { employeeId: parseInt(employeeId) },
          include: {
            template: true,
            kpiEvaluations: {
              include: {
                criteria: true
              }
            }
          }
        });
        res.json(evaluations);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  };
  
  module.exports = {evaluationController};