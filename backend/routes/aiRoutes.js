const express = require("express");
const {
    chatWithLibrarian,
    smartSearch,
    suggestCategory
} = require("../controllers/aiController");

const router = express.Router();

router.post("/chat", chatWithLibrarian);
router.get("/search", smartSearch);
router.post("/categorize", suggestCategory);

module.exports = router;
