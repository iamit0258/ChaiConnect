const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
  // Recalculate all shop ratings on startup to resolve any 0.0 ratings from previous bug
  const Shop = require('./models/Shop');
  const Review = require('./models/Review');
  
  Shop.find({}).then(async (shops) => {
    for (const shop of shops) {
      const result = await Review.aggregate([
        { $match: { shop: shop._id } },
        {
          $group: {
            _id: '$shop',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
      ]);
      if (result.length > 0) {
        await Shop.findByIdAndUpdate(shop._id, {
          averageRating: Math.round(result[0].averageRating * 10) / 10,
          reviewCount: result[0].reviewCount,
        });
      }
    }
    console.log('✅ Recalculated and fixed all shop ratings successfully.');
  }).catch(err => console.error('Error fixing ratings:', err));
});

const app = express();

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per 15 minutes per IP
  message: { message: 'Too many requests. Please try again later.' },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(globalLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ChaiConnect API is running' });
});

// Error handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n☕ ChaiConnect API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
