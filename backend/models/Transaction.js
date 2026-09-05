// Transaction Model - PostgreSQL schema definition & entity helper
// Table: transactions

class Transaction {
    constructor({ id, book_id, student_name, student_id, issue_date, return_date, status, created_at }) {
        this.id = id;
        this.book_id = book_id;
        this.student_name = student_name;
        this.student_id = student_id;
        this.issue_date = issue_date;
        this.return_date = return_date;
        this.status = status;
        this.created_at = created_at;
    }
}

module.exports = Transaction;
