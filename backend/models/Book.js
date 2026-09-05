// Book Model - PostgreSQL schema definition & entity helper
// Table: books

class Book {
    constructor({ id, title, author, isbn, category, quantity, available_quantity, created_at }) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.category = category;
        this.quantity = quantity;
        this.available_quantity = available_quantity;
        this.created_at = created_at;
    }
}

module.exports = Book;
