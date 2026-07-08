const express = require('express');
const {
  addReview,
  editReview,
  getShopReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting on review submission (spam prevention stretch goal)
const reviewLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 reviews per 5 minutes per IP
  message: { message: 'Too many reviews submitted. Please wait a few minutes.' },
});

router.get('/shop/:shopId', getShopReviews);
router.post('/:shopId', protect, reviewLimiter, addReview);
router.put('/:reviewId', protect, editReview);

module.exports = router;
