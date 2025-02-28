const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const roleAuthorization = require("../middlewares/roleMiddleware");
const authenticateUser = require("../middlewares/authMiddleware");

router.get(
  "/",
  authenticateUser,
  roleAuthorization(["Admin", "HR"]),
 userController.getEmployees
);

router.delete(
  "/:userId/delete-employee",
  authenticateUser,
  userController.deleteEmployees
);


router.put(
  "/:userId/update-employee",
  authenticateUser,
  userController.updateEmployees
);

module.exports = router;
