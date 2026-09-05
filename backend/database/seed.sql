-- NSCC Library Management System
-- Seed Data for PostgreSQL (library_db)

INSERT INTO books (title, author, isbn, category, quantity, available_quantity)
VALUES
    ('Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262033848', 'Computer Science', 5, 5),
    ('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 4, 4),
    ('Database System Concepts', 'Abraham Silberschatz, Henry F. Korth', '978-0073523323', 'Computer Science', 6, 6),
    ('Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0136042594', 'Artificial Intelligence', 3, 3),
    ('Operating System Concepts', 'Abraham Silberschatz, Peter B. Galvin', '978-1118063330', 'Computer Science', 4, 4),
    ('Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm', '978-0201633610', 'Software Engineering', 3, 3),
    ('Computer Networking: A Top-Down Approach', 'James F. Kurose, Keith W. Ross', '978-0133594140', 'Networking', 5, 5),
    ('Digital Logic and Computer Design', 'M. Morris Mano', '978-0132145107', 'Electronics', 4, 4),
    ('Higher Engineering Mathematics', 'B.S. Grewal', '978-8174091955', 'Mathematics', 8, 8),
    ('Principles of Management', 'Harold Koontz, Heinz Weihrich', '978-0070682139', 'Management', 3, 3)
ON CONFLICT (isbn) DO NOTHING;
