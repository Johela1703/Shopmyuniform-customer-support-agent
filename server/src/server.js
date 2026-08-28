import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { seedDatabase } from './scripts/seedData.js';
import Product from './models/Product.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ShopMyUniform API',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.OPENAI_API_KEY ? 'OpenAI GPT' : 'Dynamic Database RAG Engine',
  });
});

// Boot server
const startServer = async () => {
  await connectDB();

  // Auto-seed database if empty
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log('[Server] Database is empty. Running automatic seeder...');
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`[Server] ShopMyUniform Backend running on http://localhost:${PORT}`);
  });
};

startServer();
