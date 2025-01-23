const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuthorization = require("../middlewares/roleMiddleware");

router.get("/", authMiddleware, leaveController.getAllLeaveRequests);
router.get("/report/:employeeId", authMiddleware, leaveController.getLeaveReport);
router.get('/special', authMiddleware, leaveController.getSpecialLeaveRequests);
router.post("/create", authMiddleware, leaveController.createLeaveRequest);
router.post('/special-request', authMiddleware, leaveController.createSpecialLeaveRequest);
router.put(
  "/:leaveId/update-status",
  authMiddleware,
  roleAuthorization(["HR", "Lead"]),
  leaveController.updateLeaveStatus
);

module.exports = router;
