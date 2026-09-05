// Centralized Error Handling Middleware

const notFound = (req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

    res.status(statusCode).json({
        success: false,
        message: err.message || "An unexpected server error occurred",
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
};

module.exports = {
    notFound,
    errorHandler
};
