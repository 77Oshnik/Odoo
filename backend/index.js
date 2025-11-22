const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const warehouseRoutes = require('./routes/warehouse.routes');
const receiptRoutes = require('./routes/receipt.routes');
const deliveryOrderRoutes = require('./routes/deliveryOrder.routes');
const internalTransferRoutes = require('./routes/internalTransfer.routes');
const stockAdjustmentRoutes = require('./routes/stockAdjustment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const locationRoutes = require('./routes/location.routes');
const cors = require('cors');
const app = express();

app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};
app.use(cors(corsOptions));
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/delivery-orders', deliveryOrderRoutes);
app.use('/api/internal-transfers', internalTransferRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.send('Hello World from Express!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
