// const express = require('express');
// const router = express.Router();
// const performanceController = require('../controllers/performanceController');
// const protect = require('../middlewares/authMiddleware');
// const authorize = require('../middlewares/roleMiddleware');
// // Routes
// router.post('/create-kpi-form', protect, authorize('HR'), performanceController.createKPIForm);
// router.put('/assign-weightage/:id', protect, authorize('HR'), performanceController.assignWeightage);
// router.post('/activate-appraisal', protect, authorize('HR'), performanceController.activateAppraisal);
// router.get('/notifications/:employeeId', protect, performanceController.getNotifications);
// router.post('/supervisor-feedback/:employeeId', protect, authorize('Manager', 'Lead'), performanceController.supervisorFeedback);
// router.post('/final-appraisal/:employeeId', protect, authorize('HR'), performanceController.finalAppraisal);
// router.get('/appraisal-percentage/:employeeId', protect, performanceController.getAppraisalPercentage);

// module.exports = router;