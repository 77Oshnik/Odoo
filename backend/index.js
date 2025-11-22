const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Hello World from Express!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
