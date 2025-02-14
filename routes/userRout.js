const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const roleAuthorization = require("../middlewares/roleMiddleware");
const authenticateUser = require("../middlewares/authMiddleware");

router.get(
  "/",
  authenticateUser,
  roleAuthorization(["Admin", "HR","Lead"]),
 userController.getEmployees
);

module.exports = router;
