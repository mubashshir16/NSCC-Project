const pool = require("../config/db");

let GoogleGenAI = null;
try {
    const genai = require("@google/genai");
    GoogleGenAI = genai.GoogleGenAI;
} catch (e) {
    // Falls back to semantic engine
}

// 1. AI Librarian & Reading Companion Chatbot (Powered by Gemini 2.0 Flash)
const chatWithLibrarian = async (req, res, next) => {
    const { message, history = [], apiKey: clientApiKey } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            success: false,
            message: "Message is required"
        });
    }

    try {
        // Fetch current live catalog context from PostgreSQL
        const booksResult = await pool.query(
            "SELECT id, title, author, isbn, category, quantity, available_quantity FROM books ORDER BY id ASC"
        );
        const books = booksResult.rows;
        const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

        const apiKey = clientApiKey || req.headers["x-gemini-api-key"] || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        // If Gemini API key is available and @google/genai is loaded, use Gemini 2.0 Flash
        if (apiKey && GoogleGenAI) {
            try {
                const ai = new GoogleGenAI({ apiKey });

                const catalogContext = books.map(b => 
                    `- ID #${b.id}: "${b.title}" by ${b.author} | ISBN: ${b.isbn} | Category: ${b.category} | Shelf Stock: ${b.available_quantity} available (Total: ${b.quantity})`
                ).join("\n");

                const systemPrompt = `You are "Athena", a warm, witty, enthusiastic, and thoughtful college library friend and reading companion at the NSCC Library.

YOUR PERSONA & VIBE:
- You are NOT a robotic corporate assistant or a dry reference desk worker. You are like a best friend sitting across the table in a cozy library with a warm cup of coffee, genuinely excited to talk about books, literature, coding, science, philosophy, and life.
- You speak naturally, warmly, and empathetically, using conversational, friendly language (e.g. "Oh, I love that one!", "Honestly, that ending caught me so off guard!", "Tell me everything—what did you think of the characters?", "If you loved that, you will be totally obsessed with...").
- You are deeply passionate about books of all kinds: fiction, sci-fi, fantasy, classics, psychology, philosophy, memoirs, coding & engineering textbooks, productivity, and academic non-fiction.
- Keep the conversation flowing like a true friend: ask curious follow-up questions about what they loved most, which character or concept resonated with them, or what reading mood they are in right now.

YOUR SUPERPOWERS:
1. TALKING ABOUT BOOKS READ:
   - When the user tells you about books they have read, celebrate it! Dive deep into the plot, themes, ideas, favorite scenes, or hot takes. Validate their opinions (even if they disliked a popular bestseller!).
   - Discuss themes, character arcs, emotional moments, and philosophical takeaways.

2. ACTUALLY SUGGESTING BOOKS:
   - Always give vivid, exciting, and specific book suggestions tailored to their taste, mood, or academic coursework. Explain WHY they will enjoy it.
   - GROUNDED IN NSCC LIBRARY: You have direct access to our real-time college catalog in PostgreSQL:
${catalogContext}
   - When suggesting a book that exists in our NSCC Library, highlight it excitedly! E.g.:
     "✨ *Good news!* We actually have that right here on our NSCC shelves: **[Title]** by [Author] (ID #[id]) — we currently have [X] copies available to borrow right now! You can issue it directly in the app."
   - When suggesting books outside our college textbook catalog (e.g. world literature, popular fiction, modern non-fiction), recommend them freely and enthusiastically, and let them know: "This one isn't in our university textbook collection yet, but it's an absolute must-read! You can check your local library or request our library desk to add it."

LIBRARY POLICIES (If asked):
- Loan Duration: Standard academic loan duration is 14 calendar days per book.
- Borrowing: Students need their Student Name & Roll Number/ID.
- Direct Actions: One-click issuance and returns are available directly in the portal.

FORMATTING:
- Use clean, beautiful markdown (bold titles, bullet points, occasional friendly emojis). Keep responses engaging, well-spaced, and delightful to read.`;

                // Build multi-turn contents for Gemini
                const contents = [];
                if (Array.isArray(history) && history.length > 0) {
                    for (const item of history) {
                        if (!item.content || typeof item.content !== "string") continue;
                        const role = (item.role === "user") ? "user" : "model";
                        contents.push({
                            role: role,
                            parts: [{ text: item.content }]
                        });
                    }
                }

                // Append current user message
                contents.push({
                    role: "user",
                    parts: [{ text: message.trim() }]
                });

                // Ensure contents starts with a user turn
                while (contents.length > 0 && contents[0].role !== "user") {
                    contents.shift();
                }
                if (contents.length === 0) {
                    contents.push({ role: "user", parts: [{ text: message.trim() }] });
                }

                // Call Gemini 2.0 Flash
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: contents,
                    config: {
                        systemInstruction: systemPrompt,
                        temperature: 0.85,
                        topP: 0.95
                    }
                });

                const replyText = response.text || "I'm thinking about that book! Could you say a bit more about what you enjoyed about it?";

                // Extract any library books referenced in reply
                const lowerReply = replyText.toLowerCase();
                const matchedBooks = books.filter(b => 
                    lowerReply.includes(b.title.toLowerCase()) || 
                    (b.title.length > 6 && lowerReply.includes(b.title.toLowerCase().substring(0, 16))) ||
                    lowerReply.includes(b.isbn.toLowerCase())
                );

                return res.json({
                    success: true,
                    engine: "Gemini 2.0 Flash (Google AI)",
                    reply: replyText,
                    recommendations: matchedBooks.slice(0, 4)
                });
            } catch (geminiError) {
                console.warn("Gemini 2.0 Flash API call failed, falling back to local companion engine:", geminiError.message);
                // If it was an authentication error with client key, report helpful hint
                if (geminiError.message && (geminiError.message.includes("API key not valid") || geminiError.message.includes("403") || geminiError.message.includes("401"))) {
                    return res.json({
                        success: true,
                        engine: "Athena Friend Engine (Key Notice)",
                        reply: `👋 Hey! I noticed that the Gemini API key provided wasn't accepted by Google (${geminiError.message.split("\n")[0]}).\n\nPlease double check your key in the **Settings (⚙️)** at the top of this drawer! In the meantime, I'm still right here to chat about books and help you explore our library catalog. What would you like to talk about?`,
                        recommendations: books.filter(b => b.available_quantity > 0).slice(0, 3)
                    });
                }
            }
        }

        // Conversational Fallback Companion Engine (When no Gemini key is provided)
        const userMsg = message.trim().toLowerCase();
        let matchedBooks = [];
        let reply = "";

        // Discussing books read (e.g. "I read...", "I finished...", "What do you think of...")
        if (userMsg.includes("read") || userMsg.includes("finished") || userMsg.includes("loved") || userMsg.includes("favorite") || userMsg.includes("opinion") || userMsg.includes("think of")) {
            // Find any matching title in user's prompt
            const mentionedBook = books.find(b => userMsg.includes(b.title.toLowerCase()));

            if (mentionedBook) {
                reply = `☕ **Oh, I love talking about that!**\n\n` +
                        `*${mentionedBook.title}* by ${mentionedBook.author} is such a staple! What was your biggest takeaway from it? Did you find the concepts easy to digest, or did you have to reread a few sections?\n\n` +
                        `✨ **On Our Shelves:** We currently have **${mentionedBook.available_quantity} copies available** in the ${mentionedBook.category} section (ISBN: \`${mentionedBook.isbn}\`).\n\n` +
                        `If you enjoyed that, I'd definitely recommend checking out other titles in **${mentionedBook.category}**! What kind of book are you looking to dive into next?`;
                matchedBooks = [mentionedBook];
            } else {
                reply = `☕ **That sounds awesome! I love hearing about what people are reading.**\n\n` +
                        `Tell me more about it! What drew you into the story or concepts? Was it the writing style, the pacing, or a specific scene that stuck with you?\n\n` +
                        `If you're looking for your next adventure or study companion, tell me what vibe you're craving—thrilling sci-fi, mind-expanding non-fiction, or a classic computer science masterclass!\n\n` +
                        `*(💡 Tip: To unlock full natural conversation with my **Gemini 2.0 Flash** brain, tap the ⚙️ icon above to enter your free Gemini API key!)*`;
                matchedBooks = books.filter(b => b.available_quantity > 0).slice(0, 3);
            }
        }
        // Recommendations request
        else if (userMsg.includes("recommend") || userMsg.includes("suggest") || userMsg.includes("what should i read") || userMsg.includes("next book")) {
            const availableBooks = books.filter(b => b.available_quantity > 0);
            const picks = availableBooks.sort(() => 0.5 - Math.random()).slice(0, 3);

            reply = `✨ **Here are a few fantastic books I think you'll really enjoy:**\n\n` +
                    picks.map(b => 
                        `• 📖 **${b.title}** by *${b.author}*\n` +
                        `   *Why you'll like it:* Essential reading in **${b.category}** with practical, foundational insights.\n` +
                        `   *Shelf Stock:* **${b.available_quantity} copies available** right now in our library!`
                    ).join("\n\n") +
                    `\n\nWhich of these catches your eye? Or are you looking for a specific topic like AI, algorithms, or systems?`;
            matchedBooks = picks;
        }
        // Borrowing Rules / Policies
        else if (userMsg.includes("rule") || userMsg.includes("policy") || userMsg.includes("duration") || userMsg.includes("overdue") || userMsg.includes("how long") || userMsg.includes("fine") || userMsg.includes("how many days")) {
            reply = `📚 **Here's the scoop on borrowing at NSCC:**\n\n` +
                    `• **14-Day Loan Window:** You have a full **14 calendar days** to read and enjoy any borrowed book before it's due.\n` +
                    `• **Simple Checkout:** All you need is your **Student Name** and **Roll Number/ID** to issue a copy.\n` +
                    `• **Hassle-Free Returns:** You can return your book anytime with one click in the Circulation History or Dashboard.\n` +
                    `• **Overdue Alerts:** The Admin Dashboard keeps track of active loans and alerts you if any book passes 14 days so you can return it promptly!`;
        }
        // Specific book availability check
        else if (userMsg.includes("available") || userMsg.includes("in stock") || userMsg.includes("check")) {
            matchedBooks = books.filter(b => 
                userMsg.includes(b.title.toLowerCase()) || 
                b.title.toLowerCase().split(" ").some(w => w.length > 3 && userMsg.includes(w)) ||
                userMsg.includes(b.isbn.toLowerCase())
            );

            if (matchedBooks.length > 0) {
                reply = `📖 **Let's check the shelves for you:**\n\n` +
                        matchedBooks.map(b => {
                            const inStock = b.available_quantity > 0;
                            return `• **${b.title}** by ${b.author}\n` +
                                   `   Status: **${inStock ? `✅ ${b.available_quantity} copies on shelf ready to borrow` : `❌ Currently checked out (0/${b.quantity})`}** | ISBN: \`${b.isbn}\``;
                        }).join("\n\n");
            } else {
                const availableList = books.filter(b => b.available_quantity > 0).slice(0, 4);
                reply = `We have **${books.filter(b => b.available_quantity > 0).length} books ready for checkout**! Here are a few ready on the shelves:\n\n` +
                        availableList.map(b => `• **${b.title}** (${b.available_quantity} available) — *${b.category}*`).join("\n");
                matchedBooks = availableList;
            }
        }
        // General greeting / casual chat
        else {
            matchedBooks = books.filter(b => {
                const titleMatch = b.title.toLowerCase().split(/[\s,:-]+/).some(w => w.length > 3 && userMsg.includes(w));
                const authorMatch = b.author.toLowerCase().split(/[\s,]+/).some(w => w.length > 3 && userMsg.includes(w));
                const catMatch = b.category && userMsg.includes(b.category.toLowerCase());
                return titleMatch || authorMatch || catMatch;
            });

            if (matchedBooks.length > 0) {
                reply = `🔍 **I found some great matches in our collection for you:**\n\n` +
                        matchedBooks.slice(0, 4).map(b => 
                            `• 📚 **${b.title}** by *${b.author}*\n` +
                            `   Category: *${b.category || 'General'}* | **${b.available_quantity > 0 ? `✅ ${b.available_quantity} copies in stock` : '⚠️ All copies checked out'}** (ISBN: \`${b.isbn}\`)`
                        ).join("\n\n") +
                        `\n\nWould you like me to tell you more about any of these, or help you issue a copy?`;
            } else {
                reply = `👋 **Hey there! I'm Athena, your NSCC library friend!** ☕📖\n\n` +
                        `I'm always ready to talk about books, discuss stories you've read, or help you pick your next great read. What kind of books are you usually drawn to—tech, fiction, science, or productivity?\n\n` +
                        `*(💡 Want deep conversational discussions with Gemini 2.0 Flash? Click the **⚙️ icon** above to add your free Google AI Studio API key!)*`;
                matchedBooks = books.filter(b => b.available_quantity > 0).slice(0, 3);
            }
        }

        res.json({
            success: true,
            engine: "Athena Companion Engine (Local)",
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
