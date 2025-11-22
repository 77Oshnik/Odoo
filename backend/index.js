const dotenv=require('dotenv')
dotenv.config()
const express = require('express');
const app = express();
const connectDB = require('./config/db');

// Middleware to parse JSON
app.use(express.json());
connectDB();

// Default Route
app.get('/', (req, res) => {
    res.send('Hello World from Express!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
