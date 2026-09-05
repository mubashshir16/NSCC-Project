const express = require("express");
const {
    getTransactions,
    exportTransactions,
    issueBook,
    returnBook,
    getDashboardStats
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/export", exportTransactions);
router.get("/", getTransactions);
router.post("/", issueBook);
router.patch("/:id/return", returnBook);
router.put("/:id/return", returnBook);

module.exports = router;