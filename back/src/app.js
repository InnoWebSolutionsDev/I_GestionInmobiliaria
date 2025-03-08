const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const routes = require("./routes/index.js")

const allowedOrigins = [
    'http://localhost:5173', // Permitir localhost para desarrollo
];

const app = express()

app.use(express.json())
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(morgan("dev"))

// Routes
app.use("/", routes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error Handler:', {
        path: req.path,
        method: req.method,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler - must be last
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path
    });
});

module.exports = app