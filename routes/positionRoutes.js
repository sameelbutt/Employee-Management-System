const express = require("express");
const router = express.Router();
const positionController = require("../controllers/positionController");

router.get("/", positionController.getAllPositions);
router.get(
  "/department/:departmentId",
  positionController.getPositionsByDepartment
);

router.post("/", positionController.createPosition);

module.exports = router;
