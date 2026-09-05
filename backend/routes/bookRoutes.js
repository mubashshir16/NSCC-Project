const express = require("express");
const {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getCategories
} = require("../controllers/bookController");

const router = express.Router();

router.get("/categories", getCategories);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

module.exports = router;