# ShopMyUniform 🏫 | MERN E-Commerce & AI Customer Support Agent

> **ShopMyUniform** is a full-stack MERN (MongoDB, Express, React, Node.js) e-commerce web application with an integrated **Database-Grounded AI Customer Support Agent**. The AI assistant answers questions regarding product stock, size availability, live order tracking, delivery timelines, and exchange policies by querying actual MongoDB database records in real-time.

---

## 🌟 Features Overview

### 🛍️ E-Commerce Web Application
- **User Authentication & Profile**: Register and log in as a Parent or Student. Configure student name, grade level (Grade 1–12), and target school institution.
- **School-Specific Uniform Catalog**: Filter catalog by school (e.g., *St. Xavier's International Academy*, *Greenfield Public School*, *Oakridge International School*), student grade level, gender (Boys/Girls/Unisex), and category (Shirts, Trousers, Skirts, Blazers, PE Uniform).
- **Product Details & Real-Time Size Inventory**: Detailed product view displaying fabric material, care instructions, and live stock availability broken down by sizes (`XS`, `S`, `M`, `L`, `XL`, `XXL`).
- **Shopping Cart & Checkout**: Add uniform items with size selections, update quantities, review price breakdowns, enter shipping addresses, and create orders.
- **Order Management & Real-Time Status Tracking**: View past orders with step-by-step shipment tracking progress (`Processing` ➔ `Shipped` ➔ `Delivered`), order reference numbers (`SMU-2026-XXXX`), carrier details, and estimated delivery dates.

### 🤖 AI Customer Support Agent (RAG / DB Tool-Calling Engine)
Integrated directly into the website via a floating AI Assistant drawer widget with quick-prompt buttons and dynamic UI response cards.

- 📦 **Order Queries ("Where is my order?")**: Automatically identifies the authenticated user or order reference number (e.g. `SMU-2026-1042`), retrieves the actual live order record from MongoDB, and returns real-time status with carrier tracking numbers and item breakdowns.
- 👕 **Product Stock Queries ("Do you have white shirts for Grade 7?")**: Queries MongoDB for products matching requested school, grade level, and item keywords.
- 📏 **Size Inventory Queries ("Which sizes are available for navy trousers?")**: Fetches live size stock maps (`stockBySizes`) directly from the product collection.
- 🚚 **Delivery Guidelines ("How long will delivery take?")**: Retrieves delivery policy documents stored in the database.
- 🔄 **Returns & Exchanges ("I want to exchange my shirt. What is the process?")**: Retrieves store policy documents for 14-day doorstep size replacement procedures.
- 🏷️ **DB Query Transparency**: Displays a source tag on AI responses (e.g. `[MongoDB User Orders Query: userId=...]`) demonstrating real DB retrieval.

---

## 🏗️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Component-driven UI framework with fast HMR |
| **Styling** | Vanilla CSS3 | Custom design system with glassmorphism, HSL color system, animations |
| **Routing & Icons** | React Router v6, Lucide React | SPA navigation & modern iconography |
| **Backend** | Node.js, Express.js | REST API server & middleware architecture |
| **Database** | MongoDB, Mongoose | NoSQL document database with schema definitions & virtuals |
| **Database Fallback** | `mongodb-memory-server` | Zero-setup local embedded MongoDB for seamless testing |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt.js | Token-based authorization with password hashing |
| **AI Architecture** | OpenAI GPT-4o-mini / Gemini API + Dynamic RAG Engine | DB tool retrieval + prompt context synthesis |

---

## 🧠 AI Architecture & Integration Approach

### 1. Context Retrieval Architecture (RAG Flow)

```
                       ┌──────────────────────────────┐
                       │  User Customer Support Query │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │  POST /api/ai/chat + JWT     │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │ AI Controller Intent Engine  │
                       └──────────────┬───────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
  │ MongoDB Orders    │     │ MongoDB Products  │     │ MongoDB Policies  │
  │ Query by UserId   │     │ Filter School &   │     │ Delivery / Return │
  │ or Order Number   │     │ Grade Stock Map   │     │ Procedure Context │
  └─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │ Prompt Context Synthesis     │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │ LLM API / Rule-Based Engine  │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │ Response + UI Card Payload   │
                       └──────────────────────────────┘
```

### 2. Implementation Approach
- When a query is received at `/api/ai/chat`, the backend inspects the query string for intent keywords (orders, products, sizes, delivery, exchanges).
- **Database Tool Retrieval**:
  - `Order.find({ userId: user._id })` or `Order.find({ orderNumber: explicitOrderNum })`
  - `Product.find({ schoolId, applicableGrades: grade, name: keyword })`
  - `Policy.find({ category: 'Delivery' | 'Returns & Exchanges' })`
- **Context Injection**: The retrieved database records are serialized and injected into the LLM system prompt as grounded context.
- **Fail-Safe Fallback**: If no external OpenAI API key is supplied, a built-in dynamic synthesis engine formats the retrieved database records directly, guaranteeing the application works out of the box without requiring API keys.

---

## 🗄️ Database Structure (MongoDB / Mongoose)

### 1. `User` Schema
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['parent', 'student', 'admin'], default: 'parent' },
  studentName: { type: String },
  grade: { type: String },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
  phone: { type: String },
  shippingAddress: { street: String, city: String, state: String, pincode: String }
}
```

### 2. `School` Schema
```javascript
{
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, uppercase: true },
  city: { type: String, required: true },
  logoUrl: { type: String },
  grades: [{ type: String }],
  contactEmail: { type: String },
  contactPhone: { type: String }
}
```

### 3. `Product` Schema
```javascript
{
  name: { type: String, required: true },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  category: { type: String, enum: ['Shirts', 'Trousers', 'Skirts', 'Blazers', 'Sweaters', 'PE Uniform', 'Shoes', 'Accessories'] },
  gender: { type: String, enum: ['Boys', 'Girls', 'Unisex'] },
  applicableGrades: [{ type: String }],
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  stockBySizes: { type: Map, of: Number, default: { XS: 10, S: 15, M: 20, L: 15, XL: 10, XXL: 5 } },
  material: { type: String },
  careInstructions: { type: String },
  isFeatured: { type: Boolean, default: false }
}
```

### 4. `Order` Schema
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true }, // e.g. SMU-2026-1042
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    size: String,
    quantity: Number,
    unitPrice: Number,
    image: String
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: { street: String, city: String, state: String, pincode: String },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
  orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Processing' },
  trackingNumber: { type: String },
  carrier: { type: String },
  estimatedDelivery: { type: String }
}
```

### 5. `Policy` Schema
```javascript
{
  category: { type: String, enum: ['Delivery', 'Returns & Exchanges', 'Size Guide', 'Payment', 'School Policies'] },
  title: { type: String, required: true },
  content: { type: String, required: true },
  highlights: [{ type: String }]
}
```

---

## 📡 API Endpoints

### 🔐 Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register`: Register new user (Parent/Student).
- `POST /api/auth/login`: User login, returns JWT token.
- `GET /api/auth/profile`: Get authenticated user profile *(Protected)*.
- `PUT /api/auth/profile`: Update profile, student details & address *(Protected)*.

### 🏫 School Endpoints (`/api/schools`)
- `GET /api/schools`: Get list of registered schools.
- `GET /api/schools/:id`: Get details of a single school.

### 👕 Product Endpoints (`/api/products`)
- `GET /api/products`: Filter products by `schoolId`, `grade`, `category`, `gender`, or `search`.
- `GET /api/products/featured`: Get featured products.
- `GET /api/products/:id`: Get detailed product information with size stock map.

### 📦 Order Endpoints (`/api/orders`)
- `POST /api/orders`: Place a new order & deduct stock *(Protected)*.
- `GET /api/orders/myorders`: Retrieve authenticated user's order history *(Protected)*.
- `GET /api/orders/:id`: Get specific order details *(Protected)*.

### 🤖 AI Agent Endpoint (`/api/ai`)
- `POST /api/ai/chat`: Process customer support question with database context retrieval *(Optional Auth)*.

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shopmyuniform
JWT_SECRET=shopmyuniform_super_secret_jwt_key_2026

# Optional: OpenAI API Key for GPT-4o-mini completion
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

> **Note**: If `MONGODB_URI` connection is unavailable, the application automatically launches `mongodb-memory-server` in-memory fallback. If `OPENAI_API_KEY` is omitted, the AI Assistant automatically uses its dynamic database RAG generator.

---

## 🚀 Instructions to Run Locally

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd "AI-Powered Customer Support Agent"
```

### Step 2: Install Dependencies
Install dependencies for both backend and frontend:
```bash
npm run install:all
```
*(Or install individually inside `server` and `client` directories via `npm install`)*.

### Step 3: Seed Database (Optional)
To pre-populate schools, uniforms, size inventory, policies, and test user orders:
```bash
npm run seed
```

### Step 4: Run Application
Start the backend server and frontend client concurrently:

**Start Backend Server (Port 5000):**
```bash
npm run server
```

**Start Frontend Client (Port 3000):**
```bash
npm run client
```

Open your browser at **`http://localhost:3000`**.

---

## 🔑 Quick Testing & Credentials

### Pre-populated Demo Account
- **Email:** `demo@shopmyuniform.com`
- **Password:** `password123`
- **Pre-existing Order Reference:** `SMU-2026-1042` (Shipped status with tracking)

### Suggested AI Chat Queries to Test DB Retrieval
1. `Where is my order?` *(Retrieves live user order status and tracking details)*
2. `Do you have white shirts for Grade 7?` *(Queries catalog stock for Grade 7)*
3. `Which sizes are available for navy blue trousers?` *(Returns live size inventory)*
4. `How long will delivery take?` *(Retrieves shipping policy context)*
5. `I want to exchange my shirt. What is the process?` *(Retrieves 14-day exchange rules)*

---

## 🔗 GitHub Repository & Live Demo
- **GitHub Repository**: [https://github.com/Johela1703/Shopmyuniform-customer-support-agent.git](https://github.com/Johela1703/Shopmyuniform-customer-support-agent.git)
- **Local Application Link**: `http://localhost:3000`


## 🔗 Live Application Link & GitHub Repository
- **GitHub Repository**: Submit repo URL
- **Live Application Link**: Deployed application URL
