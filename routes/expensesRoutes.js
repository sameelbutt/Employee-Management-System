const express = require("express");
const { getExpenses, getMonthlyExpensesByCategory, addExpense,getExpenseCategories,addExpenseCategory } = require("../controllers/expensesController");
const router = express.Router();

router.get("/", getExpenses);
router.get("/monthly", getMonthlyExpensesByCategory);
router.post("/", addExpense);
router.get("/categories", getExpenseCategories);
router.post("/categories", addExpenseCategory);
module.exports = router;
