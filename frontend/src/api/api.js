// API client service for NSCC Library Management System

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(endpoint, options = {}) {
    const config = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 502 || response.status === 503 || response.status === 504) {
                throw new Error("Backend server is offline. Please ensure the backend is running on port 5000 (cd backend && npm run dev).");
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
            throw new Error("Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000.");
        }
        console.error(`API Error on ${endpoint}:`, error.message);
        throw error;
    }
}

export const api = {
    // Health / Connection check
    checkHealth: () => request("/test-db"),

    // Books
    getBooks: (params = {}) => {
        const query = new URLSearchParams();
        if (params.search) query.append("search", params.search);
        if (params.category && params.category !== "All Categories") query.append("category", params.category);
        if (params.availability && params.availability !== "All Books") query.append("availability", params.availability);
        const queryString = query.toString();
        return request(`/books${queryString ? `?${queryString}` : ""}`);
    },

    getBookById: (id) => request(`/books/${id}`),

    getCategories: () => request("/books/categories"),

    createBook: (bookData) => request("/books", {
        method: "POST",
        body: JSON.stringify(bookData)
    }),

    updateBook: (id, bookData) => request(`/books/${id}`, {
        method: "PUT",
        body: JSON.stringify(bookData)
    }),

    deleteBook: (id) => request(`/books/${id}`, {
        method: "DELETE"
    }),

    // Transactions
    getTransactions: (params = {}) => {
        const query = new URLSearchParams();
        if (params.status && params.status !== "all") query.append("status", params.status);
        if (params.search) query.append("search", params.search);
        const queryString = query.toString();
        return request(`/transactions${queryString ? `?${queryString}` : ""}`);
    },

    getDashboardStats: () => request("/transactions/stats"),

    issueBook: (issueData) => request("/transactions", {
        method: "POST",
        body: JSON.stringify(issueData)
    }),

    returnBook: (transactionId) => request(`/transactions/${transactionId}/return`, {
        method: "PATCH"
    }),

    // Export CSV endpoint URL
    getExportUrl: () => `${API_BASE}/transactions/export`,

    // AI Features
    aiChat: (message, history = []) => request("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message, history })
    }),

    aiSmartSearch: (query) => request(`/ai/search?query=${encodeURIComponent(query)}`),

    aiSuggestCategory: (title, author = "") => request("/ai/categorize", {
        method: "POST",
        body: JSON.stringify({ title, author })
    })
};
