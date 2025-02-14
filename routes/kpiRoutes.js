// routes/kpiRoutes.js
const express = require('express');
const { kpiController } = require('../controllers/kpiController');
const { evaluationController } = require('../controllers/evaluationController');
const roleAuthorization = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// KPI Template routes (HR only)
router.post(
  '/templates',
  authMiddleware,
  roleAuthorization(['HR', 'Admin']),
  kpiController.createTemplate
);

router.get(
  '/templates',
  authMiddleware,
  roleAuthorization(['HR', 'Admin']),
  kpiController.getTemplates
);

router.put(
  '/templates/:id',
  authMiddleware,
  roleAuthorization(['HR', 'Admin']),
  kpiController.updateTemplate
);

// Evaluation routes - Specific routes first
router.get(
  '/evaluations/pending',  // Move this BEFORE the :id route
  authMiddleware,
  roleAuthorization(['Lead']),
  evaluationController.getPendingEvaluations
);

router.post(
  '/evaluations',
  authMiddleware,
  roleAuthorization(['HR', 'Admin']),
  evaluationController.createEvaluation
);

router.get(
  '/employees/:employeeId/evaluations',
  authMiddleware,
  evaluationController.getEmployeeEvaluations
);

router.post(
  '/evaluations/:evaluationId/supervisor',
  authMiddleware,
  roleAuthorization(['Manager', 'Lead', 'Admin']),
  evaluationController.submitSupervisorEvaluation
);

router.post(
  '/evaluations/:evaluationId/hr',
  authMiddleware,
  roleAuthorization(['HR', 'Admin']),
  evaluationController.submitHREvaluation
);

// Put the generic :id route last
router.get(
  '/evaluations/:id',
  authMiddleware,
  evaluationController.getEvaluation
);

module.exports = router;