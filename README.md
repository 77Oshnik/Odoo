# StockMaster 📦

A modern, full-stack inventory management system built with Next.js and Node.js. StockMaster provides comprehensive tools for managing products, warehouses, stock movements, and operations with a beautiful, intuitive interface.

## 🌟 Features

### 📊 Dashboard
- Real-time KPIs and metrics
- Quick filters for categories, warehouses, and document statuses
- Inventory overview with low stock alerts
- Operational snapshot showing pending receipts, deliveries, and transfers
- Interactive cards with navigation to detailed views

### 📦 Product Management
- Complete CRUD operations for products
- Category-based organization
- Multi-warehouse stock tracking
- Stock by location visibility
- Low stock product monitoring
- SKU-based product identification

### 🏭 Warehouse Management
- Multiple warehouse support
- Location-based organization
- Address and contact information
- Active/inactive warehouse status
- Stock distribution across warehouses

### 📥 Receipt Management
- Inbound stock receipt processing
- Supplier tracking
- Product-wise quantity received
- Receipt validation workflow
- Status tracking (draft, waiting, ready, done, canceled)

### 📤 Delivery Order Management
- Outbound delivery processing
- Customer order tracking
- Pick, Pack, and Validate workflow
- Multi-product deliveries
- Delivery status tracking (draft, waiting, ready, done, canceled)
- Quantity tracking (ordered, picked, packed)

### ⚖️ Stock Adjustments
- Inventory discrepancy correction
- Reason tracking (damaged, lost, found, expired, miscounted, other)
- Recorded vs counted quantity comparison
- Automatic stock ledger updates
- Audit trail with user tracking

### 🔄 Internal Transfers
- Inter-warehouse stock transfers
- Source and destination warehouse tracking
- Transfer scheduling
- Status management (draft, waiting, ready, done, canceled)
- Product-wise quantity tracking

### 📋 Categories
- Product categorization
- Category-based filtering
- Description support

### 📍 Locations
- Warehouse location management
- Location codes
- Hierarchical organization

### 🔐 Authentication
- Secure user authentication
- JWT-based authorization
- Password encryption with bcrypt
- Email-based login
- Forgot password functionality
- Protected routes

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.1.3 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion, GSAP
- **HTTP Client**: Axios
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 9.0.0
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Email**: Nodemailer
- **Environment**: dotenv
- **CORS**: cors

## 📁 Project Structure

### Backend Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   ├── auth.controller.js    # Authentication logic
│   ├── category.controller.js
│   ├── deliveryOrder.controller.js
│   ├── internalTransfer.controller.js
│   ├── location.controller.js
│   ├── product.controller.js
│   ├── receipt.controller.js
│   ├── stockAdjustment.controller.js
│   ├── warehouse.controller.js
│   ├── dashboard.controller.js
│   └── moveHistory.controller.js
├── models/
│   ├── user.model.js
│   ├── category.model.js
│   ├── deliveryOrder.model.js
│   ├── internalTransfer.model.js
│   ├── location.model.js
│   ├── product.model.js
│   ├── receipt.model.js
│   ├── reorderingRule.model.js
│   ├── stockAdjustment.model.js
│   ├── stockLedger.model.js
│   └── warehouse.model.js
├── routes/
│   ├── auth.routes.js
│   ├── category.routes.js
│   ├── deliveryOrder.routes.js
│   ├── internalTransfer.routes.js
│   ├── location.routes.js
│   ├── product.routes.js
│   ├── receipt.routes.js
│   ├── stockAdjustment.routes.js
│   ├── warehouse.routes.js
│   ├── dashboard.routes.js
│   └── moveHistory.routes.js
├── validators/
│   └── *.validator.js        # Request validation schemas
├── middlewares/
│   ├── auth.js               # JWT authentication middleware
│   └── validate.js           # Validation middleware
├── utils/
│   └── email.js              # Email utility functions
├── seed.js                   # Database seeding script
├── index.js                  # Application entry point
└── package.json
```

### Frontend Structure

```
frontend/
├── app/
│   ├── (auth)/               # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (protected)/          # Protected routes
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── warehouses/
│   │   ├── locations/
│   │   ├── receipts/
│   │   ├── delivery-orders/
│   │   ├── stock-adjustments/
│   │   ├── stock-ledger/
│   │   └── layout.tsx        # Protected layout with AppShell
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/
│   │   ├── app-shell.tsx     # Main app layout
│   │   └── app-header.tsx    # Navigation header
│   ├── feature-gallery.tsx
│   └── footer.tsx
├── lib/
│   ├── features/
│   │   └── auth/
│   │       └── authSlice.ts  # Redux auth slice
│   ├── store.ts              # Redux store configuration
│   ├── axios.ts              # Axios instance with interceptors
│   └── utils.ts              # Utility functions
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.10.0 or higher recommended)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/77Oshnik/Odoo.git
cd Odoo
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and other configurations
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stockmaster
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start MongoDB** (if running locally)
```bash
mongod
```

2. **Seed the Database** (optional, for sample data)
```bash
cd backend
npm run seed
```

This will create:
- 3 Users (admin@stockmaster.com / password123)
- 5 Categories
- 5 Locations
- 3 Warehouses
- 8 Products with stock
- 3 Receipts
- 4 Delivery Orders
- 3 Stock Adjustments
- 3 Internal Transfers

3. **Start Backend Server**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

4. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
Application runs on http://localhost:3000

### Default Login Credentials
```
Email: admin@stockmaster.com
Password: password123
```

## 📸 Screenshots

### Landing Page
![Landing Page](./screenshots/landing-page.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Products Management
![Products](./screenshots/products.png)

### Delivery Orders
![Delivery Orders](./screenshots/delivery-orders.png)

### Stock Adjustments
![Stock Adjustments](./screenshots/stock-adjustments.png)

## 🔑 Key Backend Functionalities

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with auth middleware
- Email verification support

### Stock Ledger System
- Automatic tracking of all stock movements
- Transaction types: receipt, delivery, adjustment, transfer
- Reference document tracking
- Balance calculation
- User audit trail

### Delivery Order Workflow
1. **Draft**: Initial creation
2. **Waiting**: Items picked
3. **Ready**: Items packed
4. **Done**: Validated and stock deducted
5. **Canceled**: Order canceled

### Receipt Workflow
1. **Draft**: Initial creation
2. **Waiting**: Awaiting receipt
3. **Ready**: Ready to validate
4. **Done**: Validated and stock added
5. **Canceled**: Receipt canceled

### Stock Adjustment Process
- Validates recorded quantity matches current stock
- Calculates adjustment quantity (counted - recorded)
- Updates product stock
- Creates stock ledger entry
- Tracks adjustment reason and user

### Internal Transfer Process
- Validates source warehouse has sufficient stock
- Deducts from source warehouse
- Adds to destination warehouse
- Creates stock ledger entries for both warehouses
- Tracks transfer status and completion

## 🔒 Security Features

- Password encryption with bcrypt
- JWT token-based authentication
- HTTP-only cookie support
- CORS configuration
- Input validation with express-validator
- Protected API routes
- XSS protection

## 🎨 UI/UX Features

- Modern dark theme with glassmorphism
- Responsive design for all screen sizes
- Smooth animations with Framer Motion
- Interactive data visualizations
- Real-time form validation
- Toast notifications for user feedback
- Loading states and skeletons
- Breadcrumb navigation
- Quick filters and search

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/search` - Search products
- `GET /api/products/low-stock` - Get low stock products

### Delivery Orders
- `GET /api/delivery-orders` - Get all delivery orders
- `GET /api/delivery-orders/:id` - Get delivery order by ID
- `POST /api/delivery-orders` - Create delivery order
- `PUT /api/delivery-orders/:id` - Update delivery order
- `DELETE /api/delivery-orders/:id` - Delete delivery order
- `POST /api/delivery-orders/:id/pick` - Pick items
- `POST /api/delivery-orders/:id/pack` - Pack items
- `POST /api/delivery-orders/:id/validate` - Validate order
- `POST /api/delivery-orders/:id/cancel` - Cancel order

### Stock Adjustments
- `GET /api/stock-adjustments` - Get all adjustments
- `GET /api/stock-adjustments/:id` - Get adjustment by ID
- `POST /api/stock-adjustments` - Create adjustment
- `DELETE /api/stock-adjustments/:id` - Delete adjustment

### Dashboard
- `GET /api/dashboard/kpis` - Get dashboard KPIs
- `GET /api/dashboard/filters` - Get filter options

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Team - Quantum Quorum

## 🙏 Acknowledgments

- shadcn/ui for the beautiful component library
- Next.js team for the amazing framework
- MongoDB team for the robust database
- All open-source contributors

---

**StockMaster** - Modern Inventory Management Made Simple
