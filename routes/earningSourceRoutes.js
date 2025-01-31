const express = require("express");
const { getEarningSources, addEarningSource } = require("../controllers/earningSourceController");
const router = express.Router();

router.get("/", getEarningSources);
router.post("/", addEarningSource);

module.exports = router;
