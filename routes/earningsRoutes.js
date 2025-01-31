const express = require("express");
const { getEarnings, getMonthlyEarningsBySource, addEarning } = require("../controllers/earningsController");
const router = express.Router();

router.get("/", getEarnings);
router.get("/monthly", getMonthlyEarningsBySource);
router.post("/", addEarning);

module.exports = router;
