require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Import models
const User = require('./models/user.model');
const Category = require('./models/category.model');
const Location = require('./models/location.model');
const Warehouse = require('./models/warehouse.model');
const Product = require('./models/product.model');
const Receipt = require('./models/receipt.model');
const DeliveryOrder = require('./models/deliveryOrder.model');
const StockAdjustment = require('./models/stockAdjustment.model');
const InternalTransfer = require('./models/internalTransfer.model');

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('🔗 Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Category.deleteMany({});
        await Location.deleteMany({});
        await Warehouse.deleteMany({});
        await Product.deleteMany({});
        await Receipt.deleteMany({});
        await DeliveryOrder.deleteMany({});
        await StockAdjustment.deleteMany({});
        await InternalTransfer.deleteMany({});
        console.log('✅ Existing data cleared');

        // 1. Create Users
        console.log('👤 Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@stockmaster.com',
                password: hashedPassword,
            },
            {
                name: 'John Doe',
                email: 'john@stockmaster.com',
                password: hashedPassword,
            },
            {
                name: 'Jane Smith',
                email: 'jane@stockmaster.com',
                password: hashedPassword,
            },
        ]);
        console.log(`✅ Created ${users.length} users`);

        // 2. Create Categories
        console.log('📁 Creating categories...');
        const categories = await Category.create([
            { name: 'Electronics', description: 'Electronic devices and components' },
            { name: 'Furniture', description: 'Office and home furniture' },
            { name: 'Stationery', description: 'Office supplies and stationery' },
            { name: 'Hardware', description: 'Tools and hardware items' },
            { name: 'Consumables', description: 'Consumable items and supplies' },
        ]);
        console.log(`✅ Created ${categories.length} categories`);

        // 3. Create Locations
        console.log('📍 Creating locations...');
        const locations = await Location.create([
            { name: 'Main Storage', code: 'MS-001' },
            { name: 'Secondary Storage', code: 'SS-001' },
            { name: 'Warehouse A', code: 'WH-A' },
            { name: 'Warehouse B', code: 'WH-B' },
            { name: 'Cold Storage', code: 'CS-001' },
        ]);
        console.log(`✅ Created ${locations.length} locations`);

        // 4. Create Warehouses
        console.log('🏭 Creating warehouses...');
        const warehouses = await Warehouse.create([
            {
                name: 'Main Warehouse',
                location: locations[0]._id,
                address: '123 Main St, New York, NY 10001',
                isActive: true,
            },
            {
                name: 'Secondary Warehouse',
                location: locations[1]._id,
                address: '456 Second Ave, Brooklyn, NY 11201',
                isActive: true,
            },
            {
                name: 'West Coast Hub',
                location: locations[2]._id,
                address: '789 West Blvd, Los Angeles, CA 90001',
                isActive: true,
            },
        ]);
        console.log(`✅ Created ${warehouses.length} warehouses`);

        // 5. Create Products with stock
        console.log('📦 Creating products...');
        const products = await Product.create([
            {
                name: 'Laptop Dell XPS 15',
                sku: 'LAPTOP-001',
                category: categories[0]._id,
                unitOfMeasure: 'Unit',
                stockByLocation: [
                    { warehouse: warehouses[0]._id, quantity: 50 },
                    { warehouse: warehouses[1]._id, quantity: 30 },
                ],
                totalStock: 80,
                isActive: true,
            },
            {
                name: 'Office Chair Ergonomic',
                sku: 'CHAIR-001',
                category: categories[1]._id,
                unitOfMeasure: 'Unit',
                stockByLocation: [
                    { warehouse: warehouses[0]._id, quantity: 100 },
                    { warehouse: warehouses[2]._id, quantity: 75 },
                ],
                totalStock: 175,
                isActive: true,
            },
            {
                name: 'Wireless Mouse Logitech',
                sku: 'MOUSE-001',
                category: categories[0]._id,
                unitOfMeasure: 'Unit',
                stockByLocation: [
                    { warehouse: warehouses[0]._id, quantity: 200 },
                    { warehouse: warehouses[1]._id, quantity: 150 },
                ],
                totalStock: 350,
                isActive: true,
            },
            {
                name: 'A4 Paper Ream',
                sku: 'PAPER-001',
                category: categories[2]._id,
                unitOfMeasure: 'Ream',
                stockByLocation: [
                    { warehouse: warehouses[0]._id, quantity: 500 },
                    { warehouse: warehouses[1]._id, quantity: 300 },
                ],
                totalStock: 800,
                isActive: true,
            },
            {
                name: 'Standing Desk',
                sku: 'DESK-001',
                category: categories[1]._id,
                unitOfMeasure: 'Unit',
                stockByLocation: [
                    { warehouse: warehouses[0]._id, quantity: 25 },
                    { warehouse: warehouses[2]._id, quantity: 20 },
                ],
                totalStock: 45,
                isActive: true,
            },
            {
                name: 'USB-C Cable 2m',
                sku: 'CABLE-001',
                category: categories[0]._id,
                unitOfMeasure: 'Unit',
                stockByLocation: [
                    { warehouse: warehouses[0]._id, quantity: 400 },
                    { warehouse: warehouses[1]._id, quantity: 250 },
                ],
                totalStock: 650,
                isActive: true,
            },
            {
                name: 'Whiteboard Marker Set',
                sku: 'MARKER-001',
                category: categories[2]._id,
                unitOfMeasure: 'Set',
                stockByLocation: [
                    { warehouse: warehouses[0]._id, quantity: 150 },
                ],
                totalStock: 150,
                isActive: true,
            },
            {
                name: 'Screwdriver Set',
                sku: 'TOOL-001',
                category: categories[3]._id,
                unitOfMeasure: 'Set',
                stockByLocation: [
                    { warehouse: warehouses[0]._id, quantity: 80 },
                    { warehouse: warehouses[2]._id, quantity: 60 },
                ],
                totalStock: 140,
                isActive: true,
            },
        ]);
        console.log(`✅ Created ${products.length} products`);

        // 6. Create Receipts
        console.log('📥 Creating receipts...');
        const receipts = await Receipt.create([
            {
                supplier: 'Tech Supplies Inc.',
                warehouse: warehouses[0]._id,
                products: [
                    {
                        product: products[0]._id,
                        quantityReceived: 50,
                    },
                    {
                        product: products[2]._id,
                        quantityReceived: 100,
                    },
                ],
                status: 'done',
                receivedDate: new Date('2024-01-16'),
                validatedBy: users[0]._id,
                validatedAt: new Date('2024-01-16'),
                notes: 'Initial stock order',
            },
            {
                supplier: 'Office Furniture Co.',
                warehouse: warehouses[0]._id,
                products: [
                    {
                        product: products[1]._id,
                        quantityReceived: 100,
                    },
                    {
                        product: products[4]._id,
                        quantityReceived: 25,
                    },
                ],
                status: 'done',
                receivedDate: new Date('2024-01-20'),
                validatedBy: users[0]._id,
                validatedAt: new Date('2024-01-20'),
            },
            {
                supplier: 'Stationery World',
                warehouse: warehouses[0]._id,
                products: [
                    {
                        product: products[3]._id,
                        quantityReceived: 500,
                    },
                ],
                status: 'waiting',
                notes: 'Awaiting validation',
            },
        ]);
        console.log(`✅ Created ${receipts.length} receipts`);

        // 7. Create Delivery Orders
        console.log('📤 Creating delivery orders...');
        const deliveryOrders = await DeliveryOrder.create([
            {
                customer: 'ABC Corporation',
                warehouse: warehouses[0]._id,
                products: [
                    {
                        product: products[0]._id,
                        quantityOrdered: 10,
                        quantityPicked: 10,
                        quantityPacked: 10,
                    },
                    {
                        product: products[2]._id,
                        quantityOrdered: 20,
                        quantityPicked: 20,
                        quantityPacked: 20,
                    },
                ],
                status: 'done',
                deliveryDate: new Date('2024-02-10'),
                validatedBy: users[0]._id,
                validatedAt: new Date('2024-02-10'),
                notes: 'Urgent delivery',
            },
            {
                customer: 'XYZ Enterprises',
                warehouse: warehouses[0]._id,
                products: [
                    {
                        product: products[1]._id,
                        quantityOrdered: 15,
                        quantityPicked: 15,
                        quantityPacked: 15,
                    },
                ],
                status: 'ready',
                deliveryDate: new Date('2024-02-15'),
                notes: 'Ready for delivery',
            },
            {
                customer: 'Tech Startup LLC',
                warehouse: warehouses[0]._id,
                products: [
                    {
                        product: products[5]._id,
                        quantityOrdered: 50,
                        quantityPicked: 50,
                        quantityPacked: 0,
                    },
                ],
                status: 'waiting',
                deliveryDate: new Date('2024-02-20'),
            },
            {
                customer: 'Global Solutions Inc.',
                warehouse: warehouses[0]._id,
                products: [
                    {
                        product: products[3]._id,
                        quantityOrdered: 100,
                        quantityPicked: 0,
                        quantityPacked: 0,
                    },
                ],
                status: 'draft',
                deliveryDate: new Date('2024-02-25'),
            },
        ]);
        console.log(`✅ Created ${deliveryOrders.length} delivery orders`);

        // 8. Create Stock Adjustments
        console.log('⚖️  Creating stock adjustments...');
        const stockAdjustments = await StockAdjustment.create([
            {
                product: products[2]._id,
                warehouse: warehouses[0]._id,
                recordedQuantity: 200,
                countedQuantity: 195,
                adjustmentQuantity: -5,
                reason: 'damaged',
                notes: 'Found 5 damaged units during inspection',
                adjustedBy: users[0]._id,
            },
            {
                product: products[3]._id,
                warehouse: warehouses[0]._id,
                recordedQuantity: 500,
                countedQuantity: 505,
                adjustmentQuantity: 5,
                reason: 'found',
                notes: 'Found additional units in storage',
                adjustedBy: users[1]._id,
            },
            {
                product: products[6]._id,
                warehouse: warehouses[0]._id,
                recordedQuantity: 150,
                countedQuantity: 148,
                adjustmentQuantity: -2,
                reason: 'lost',
                notes: 'Missing units after inventory count',
                adjustedBy: users[0]._id,
            },
        ]);
        console.log(`✅ Created ${stockAdjustments.length} stock adjustments`);

        // 9. Create Internal Transfers
        console.log('🔄 Creating internal transfers...');
        const internalTransfers = await InternalTransfer.create([
            {
                sourceWarehouse: warehouses[0]._id,
                destinationWarehouse: warehouses[1]._id,
                products: [
                    {
                        product: products[0]._id,
                        quantity: 20,
                    },
                ],
                status: 'done',
                scheduledDate: new Date('2024-02-05'),
                completedBy: users[0]._id,
                completedAt: new Date('2024-02-05'),
                notes: 'Rebalancing stock between warehouses',
            },
            {
                sourceWarehouse: warehouses[0]._id,
                destinationWarehouse: warehouses[2]._id,
                products: [
                    {
                        product: products[1]._id,
                        quantity: 30,
                    },
                    {
                        product: products[4]._id,
                        quantity: 10,
                    },
                ],
                status: 'done',
                scheduledDate: new Date('2024-02-08'),
                completedBy: users[0]._id,
                completedAt: new Date('2024-02-08'),
            },
            {
                sourceWarehouse: warehouses[0]._id,
                destinationWarehouse: warehouses[1]._id,
                products: [
                    {
                        product: products[5]._id,
                        quantity: 50,
                    },
                ],
                status: 'draft',
                scheduledDate: new Date('2024-02-12'),
                notes: 'Awaiting transfer approval',
            },
        ]);
        console.log(`✅ Created ${internalTransfers.length} internal transfers`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Categories: ${categories.length}`);
        console.log(`   - Locations: ${locations.length}`);
        console.log(`   - Warehouses: ${warehouses.length}`);
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Receipts: ${receipts.length}`);
        console.log(`   - Delivery Orders: ${deliveryOrders.length}`);
        console.log(`   - Stock Adjustments: ${stockAdjustments.length}`);
        console.log(`   - Internal Transfers: ${internalTransfers.length}`);
        console.log('\n🔑 Login credentials:');
        console.log('   Email: admin@stockmaster.com');
        console.log('   Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
