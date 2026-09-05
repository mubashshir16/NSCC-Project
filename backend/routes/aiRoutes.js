const express = require("express");
const {
    chatWithLibrarian,
    smartSearch,
    suggestCategory,
    getAiStatus
} = require("../controllers/aiController");

const router = express.Router();

router.get("/status", getAiStatus);
router.post("/chat", chatWithLibrarian);
router.get("/search", smartSearch);
router.post("/categorize", suggestCategory);

module.exports = router;
