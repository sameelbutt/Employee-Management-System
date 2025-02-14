// // performanceController.js
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// // controllers/performanceController.js
// const Performance = require('../models/Performance');
// const Employee = require('../models/Employee');
// const Notification = require('../models/Notification');

// // Create KPI form
// exports.createKPIForm = async (req, res) => {
//     try {
//         const { employeeId, kpis } = req.body;
//         const performance = await Performance.create({ employeeId, kpis });
//         res.status(201).json({ success: true, data: performance });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Assign weightage to KPIs
// exports.assignWeightage = async (req, res) => {
//     try {
//         const { kpiWeightage } = req.body;
//         const performance = await Performance.findByIdAndUpdate(req.params.id, { kpiWeightage }, { new: true });
//         res.status(200).json({ success: true, data: performance });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Activate Appraisal Form
// exports.activateAppraisal = async (req, res) => {
//     try {
//         const { employeeId, mode } = req.body; // mode: 'automatic' or 'manual'
//         await Notification.create({ employeeId, message: 'Appraisal form activated', mode });
//         res.status(200).json({ success: true, message: 'Appraisal activated' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Get Notifications
// exports.getNotifications = async (req, res) => {
//     try {
//         const notifications = await Notification.find({ employeeId: req.params.employeeId });
//         res.status(200).json({ success: true, data: notifications });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Supervisor Feedback
// exports.supervisorFeedback = async (req, res) => {
//     try {
//         const { feedback, score } = req.body;
//         const performance = await Performance.findOneAndUpdate(
//             { employeeId: req.params.employeeId },
//             { feedback, score },
//             { new: true }
//         );
//         res.status(200).json({ success: true, data: performance });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // HR Final Appraisal
// exports.finalAppraisal = async (req, res) => {
//     try {
//         const { appraisal } = req.body;
//         const performance = await Performance.findOneAndUpdate(
//             { employeeId: req.params.employeeId },
//             { appraisal, status: 'Completed' },
//             { new: true }
//         );
//         res.status(200).json({ success: true, data: performance });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Get Appraisal Percentage
// exports.getAppraisalPercentage = async (req, res) => {
//     try {
//         const performance = await Performance.findOne({ employeeId: req.params.employeeId });
//         if (!performance) {
//             return res.status(404).json({ success: false, message: 'No performance data found' });
//         }
//         res.status(200).json({ success: true, appraisal: performance.appraisal });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };
