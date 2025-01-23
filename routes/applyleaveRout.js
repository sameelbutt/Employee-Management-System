const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuthorization = require("../middlewares/roleMiddleware");

router.get("/", authMiddleware, leaveController.getAllLeaveRequests);

router.post("/create", authMiddleware, leaveController.createLeaveRequest);

router.put(
  "/:leaveId/update-status",
  authMiddleware,
  roleAuthorization(["HR", "Lead"]),
  leaveController.updateLeaveStatus
);

module.exports = router;
