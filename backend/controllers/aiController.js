const pool = require("../config/db");

let GoogleGenAI = null;
try {
    const genai = require("@google/genai");
    GoogleGenAI = genai.GoogleGenAI;
} catch (e) {
    // Falls back to semantic engine
}

// 1. AI Librarian Chatbot
const chatWithLibrarian = async (req, res, next) => {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            success: false,
            message: "Message is required"
        });
    }

    try {
        // Fetch current catalog context from PostgreSQL
        const booksResult = await pool.query(
            "SELECT id, title, author, isbn, category, quantity, available_quantity FROM books ORDER BY id ASC"
        );
        const books = booksResult.rows;

        const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        // If Gemini API key is available, use Gemini 2.5 Flash
        if (apiKey && GoogleGenAI) {
            try {
                const ai = new GoogleGenAI({ apiKey });

                const catalogContext = books.map(b => 
                    `- ID: ${b.id}, Title: "${b.title}", Author: ${b.author}, ISBN: ${b.isbn}, Category: ${b.category}, Available: ${b.available_quantity}/${b.quantity}`
                ).join("\n");

                const systemPrompt = `You are "Athena", the AI Librarian for the NSCC Library Management System.
You assist students, staff, and faculty with finding textbooks, checking availability, explaining borrowing policies, and giving personalized reading recommendations.

Library Policies:
- Maximum loan duration: 14 calendar days per book.
- Students must provide their Student ID / Roll Number and Name when issuing.
- Standard overdue policy: Please return books on time to avoid holds on student records.
- To issue or return a book, users can use the "Issue Book" and "Return Book" buttons in the portal.

Live Library Catalog (PostgreSQL database):
${catalogContext}

Instructions:
1. Ground your answers strictly on the live catalog above whenever asking about books or availability.
2. Be helpful, professional, polite, and articulate.
3. If recommending books, clearly state their exact Title, Author, Category, and whether they are currently in stock.
4. Keep answers concise and readable with markdown formatting (bullet points, bold text).`;

                const chat = ai.chats.create({
                    model: "gemini-2.5-flash",
                    config: {
                        systemInstruction: systemPrompt,
                        temperature: 0.4
                    }
                });

                const response = await chat.sendMessage({ message: message.trim() });
                const replyText = response.text;

                // Extract relevant books mentioned
                const lowerReply = replyText.toLowerCase();
                const matchedBooks = books.filter(b => 
                    lowerReply.includes(b.title.toLowerCase()) || 
                    lowerReply.includes(b.isbn.toLowerCase())
                );

                return res.json({
                    success: true,
                    engine: "Gemini 2.5 Flash (Cloud AI)",
                    reply: replyText,
                    recommendations: matchedBooks.slice(0, 4)
                });
            } catch (geminiError) {
                console.warn("Gemini API call failed, falling back to local semantic engine:", geminiError.message);
                // Fall through to local semantic reasoning engine
            }
        }

        // High-Intelligence Local Semantic Reasoning Engine (No API key needed)
        const userMsg = message.trim().toLowerCase();

        let matchedBooks = [];
        let reply = "";

        // Intent: Borrowing Rules / Policies / Loan duration
        if (userMsg.includes("rule") || userMsg.includes("policy") || userMsg.includes("duration") || userMsg.includes("overdue") || userMsg.includes("how long") || userMsg.includes("fine") || userMsg.includes("how many days")) {
            reply = `📚 **NSCC Library Circulation Policies:**\n\n` +
                    `• **Loan Period:** Standard academic loan duration is **14 calendar days** from the date of issue.\n` +
                    `• **Requirements:** A valid **Student ID / Roll Number** and **Student Full Name** are required to borrow books.\n` +
                    `• **Returns:** Borrowed books can be returned at any time before or on the due date via the **Return Book** button in the dashboard or history log.\n` +
                    `• **Overdue Monitoring:** The Admin Dashboard automatically flags books overdue past 14 days and counts overdue days.`;
        }
        // Intent: What categories or departments exist
        else if (userMsg.includes("category") || userMsg.includes("categories") || userMsg.includes("department") || userMsg.includes("subjects") || userMsg.includes("topics")) {
            reply = `🏛️ **Available Departments & Categories:**\n\n` +
                    categories.map(c => `• **${c}** (${books.filter(b => b.category === c).length} titles cataloged)`).join("\n") +
                    `\n\nYou can ask me for recommendations in any of these areas, or filter by category in the Books Collection tab!`;
        }
        // Intent: Specific book availability check (e.g. "is clean code available?", "check availability")
        else if (userMsg.includes("available") || userMsg.includes("in stock") || userMsg.includes("check")) {
            matchedBooks = books.filter(b => 
                userMsg.includes(b.title.toLowerCase()) || 
                b.title.toLowerCase().split(" ").some(w => w.length > 3 && userMsg.includes(w)) ||
                userMsg.includes(b.isbn.toLowerCase())
            );

            if (matchedBooks.length > 0) {
                reply = `📖 **Availability Status:**\n\n` +
                        matchedBooks.map(b => {
                            const inStock = b.available_quantity > 0;
                            return `• **${b.title}** by ${b.author}\n` +
                                   `   Status: **${inStock ? `✅ ${b.available_quantity} copies available` : `❌ Out of Stock (0/${b.quantity})`}** | ISBN: \`${b.isbn}\``;
                        }).join("\n\n");
            } else {
                const availableList = books.filter(b => b.available_quantity > 0).slice(0, 5);
                reply = `Currently, we have **${books.filter(b => b.available_quantity > 0).length} books in stock** ready for loan. Here are some readily available titles:\n\n` +
                        availableList.map(b => `• **${b.title}** (${b.available_quantity} on shelf) - *${b.category}*`).join("\n");
                matchedBooks = availableList;
            }
        }
        // Intent: Recommendation / Search / General inquiry
        else {
            // Match against keywords in title, author, category
            matchedBooks = books.filter(b => {
                const titleMatch = b.title.toLowerCase().split(/[\s,:-]+/).some(w => w.length > 3 && userMsg.includes(w));
                const authorMatch = b.author.toLowerCase().split(/[\s,]+/).some(w => w.length > 3 && userMsg.includes(w));
                const catMatch = b.category && userMsg.includes(b.category.toLowerCase());
                return titleMatch || authorMatch || catMatch;
            });

            if (matchedBooks.length > 0) {
                reply = `🔍 **I found ${matchedBooks.length} relevant title(s) in our library catalog:**\n\n` +
                        matchedBooks.slice(0, 5).map(b => 
                            `• **${b.title}**\n` +
                            `   Author: *${b.author}* | Department: *${b.category || 'General'}*\n` +
                            `   Availability: **${b.available_quantity > 0 ? `✅ ${b.available_quantity} available` : '⚠️ Currently checked out'}** (ISBN: \`${b.isbn}\`)`
                        ).join("\n\n") +
                        `\n\n💡 *Tip: Click on any book in the "Books Collection" tab to inspect full specifications or issue a copy!*`;
            } else {
                // General greeting or fallback
                reply = `👋 Hello! I am **Athena**, your NSCC AI Librarian Assistant.\n\n` +
                        `I can help you with:\n` +
                        `• **Finding textbooks** across Computer Science, Electronics, Mathematics, Software Engineering, and more.\n` +
                        `• **Checking real-time shelf stock** and availability.\n` +
                        `• **Explaining borrowing policies** and overdue rules.\n` +
                        `• **Recommending references** for your semester courses.\n\n` +
                        `Try asking: *"What algorithms books are available?"* or *"Do we have Clean Code?"*`;
                matchedBooks = books.filter(b => b.available_quantity > 0).slice(0, 3);
            }
        }

        res.json({
            success: true,
            engine: "Athena Semantic Librarian Engine",
            reply: reply,
            recommendations: matchedBooks.slice(0, 4)
        });

    } catch (error) {
        next(error);
    }
};

// 2. AI Natural-Language Smart Search
const smartSearch = async (req, res, next) => {
    const { query } = req.query;

    if (!query || !query.trim()) {
        return res.status(400).json({
            success: false,
            message: "Search query is required"
        });
    }

    try {
        const q = query.trim().toLowerCase();

        // Check if user specified availability filter in natural query
        const wantsAvailableOnly = q.includes("available") || q.includes("in stock") || q.includes("free");

        let sql = `
            SELECT 
                id, title, author, isbn, category, quantity, available_quantity,
                CASE 
                    WHEN LOWER(title) LIKE $1 THEN 100
                    WHEN LOWER(title) LIKE $2 THEN 80
                    WHEN LOWER(author) LIKE $2 THEN 60
                    WHEN LOWER(category) LIKE $2 THEN 50
                    WHEN LOWER(isbn) LIKE $2 THEN 90
                    ELSE 20
                END AS relevance
            FROM books
            WHERE 
                LOWER(title) LIKE $2 OR 
                LOWER(author) LIKE $2 OR 
                LOWER(category) LIKE $2 OR 
                LOWER(isbn) LIKE $2
        `;

        if (wantsAvailableOnly) {
            sql += " AND available_quantity > 0";
        }

        sql += " ORDER BY relevance DESC, available_quantity DESC";

        const cleanTerm = q.replace(/(books|book|find|show|me|available|in stock|search|about)/gi, "").trim();
        const searchPattern = `%${cleanTerm || q}%`;
        const exactPattern = `${cleanTerm || q}%`;

        const result = await pool.query(sql, [exactPattern, searchPattern]);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
            queryInterpretation: {
                originalQuery: query,
                parsedKeyword: cleanTerm || q,
                availabilityFiltered: wantsAvailableOnly
            }
        });
    } catch (error) {
        next(error);
    }
};

// 3. AI Book Auto-Categorization & Metadata Suggester
const suggestCategory = async (req, res, next) => {
    const { title, author } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Book title is required for category recommendation"
        });
    }

    const t = title.toLowerCase();

    let category = "General";
    let deweyCode = "000";
    let suggestedTags = [];

    if (t.includes("algorithm") || t.includes("data structure") || t.includes("comput") || t.includes("program") || t.includes("coding")) {
        category = "Computer Science";
        deweyCode = "005.1";
        suggestedTags = ["Algorithms", "Data Structures", "Programming", "Problem Solving"];
    } else if (t.includes("software") || t.includes("design pattern") || t.includes("clean code") || t.includes("agile") || t.includes("refactor")) {
        category = "Software Engineering";
        deweyCode = "005.12";
        suggestedTags = ["Software Architecture", "Clean Code", "Design Patterns", "Agile"];
    } else if (t.includes("ai") || t.includes("artificial intelligence") || t.includes("machine learning") || t.includes("deep learning") || t.includes("neural")) {
        category = "Artificial Intelligence";
        deweyCode = "006.3";
        suggestedTags = ["Machine Learning", "Neural Networks", "NLP", "Robotics"];
    } else if (t.includes("network") || t.includes("tcp") || t.includes("ip") || t.includes("protocol") || t.includes("internet") || t.includes("cloud")) {
        category = "Networking";
        deweyCode = "004.6";
        suggestedTags = ["Computer Networks", "Protocols", "TCP/IP", "Security"];
    } else if (t.includes("database") || t.includes("sql") || t.includes("postgres") || t.includes("nosql") || t.includes("data")) {
        category = "Database Systems";
        deweyCode = "005.74";
        suggestedTags = ["RDBMS", "SQL", "Schema Design", "Transactions"];
    } else if (t.includes("operating system") || t.includes("linux") || t.includes("unix") || t.includes("kernel") || t.includes("process")) {
        category = "Operating Systems";
        deweyCode = "005.43";
        suggestedTags = ["OS Concepts", "Processes", "Memory Management", "Kernel"];
    } else if (t.includes("logic") || t.includes("circuit") || t.includes("digital") || t.includes("microprocessor") || t.includes("electronic") || t.includes("vlsi")) {
        category = "Electronics";
        deweyCode = "621.381";
        suggestedTags = ["Digital Logic", "Circuits", "VLSI", "Hardware"];
    } else if (t.includes("math") || t.includes("calculus") || t.includes("algebra") || t.includes("statistics") || t.includes("discrete")) {
        category = "Mathematics";
        deweyCode = "510";
        suggestedTags = ["Engineering Mathematics", "Calculus", "Linear Algebra", "Probability"];
    } else if (t.includes("management") || t.includes("business") || t.includes("leader") || t.includes("finance") || t.includes("economic")) {
        category = "Management";
        deweyCode = "658";
        suggestedTags = ["Management Principles", "Operations", "Strategy", "Leadership"];
    }

    res.json({
        success: true,
        data: {
            title: title.trim(),
            suggestedCategory: category,
            deweyCode: deweyCode,
            tags: suggestedTags
        }
    });
};

module.exports = {
    chatWithLibrarian,
    smartSearch,
    suggestCategory
};
