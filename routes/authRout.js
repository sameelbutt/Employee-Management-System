const express = require("express");
const AuthController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuthorization = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.get(
  "/waiting-approval",
  authMiddleware,
  roleAuthorization(["Admin", "HR"]),
  AuthController.getPendingApprovals
);
router.put(
  "/approve/:employeeId",
  authMiddleware,
  roleAuthorization(["Admin", "HR"]),
  AuthController.approveEmployee
);

router.post(
  "/add-employee",
  authMiddleware,
  roleAuthorization(["Admin", "HR"]),
  AuthController.addEmployee
);

module.exports = router;
