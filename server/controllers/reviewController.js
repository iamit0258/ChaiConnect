const Review = require('../models/Review');
const Shop = require('../models/Shop');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const { asyncHandler } = require('../middleware/errorHandler');

// Helper: Recalculate and update shop's average rating
const updateShopRating = async (shopId) => {
  const result = await Review.aggregate([
    { $match: { shop: shopId } },
    {
      $group: {
        _id: '$shop',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Shop.findByIdAndUpdate(shopId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: result[0].reviewCount,
    });
  } else {
    await Shop.findByIdAndUpdate(shopId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

// @desc    Add a review to a shop
// @route   POST /api/reviews/:shopId
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, text } = req.body;
  const shopId = req.params.shopId;
  const userId = req.user._id;

  if (!rating || !text) {
    res.status(400);
    throw new Error('Rating and review text are required');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Check if shop exists
  const shop = await Shop.findById(shopId);
  if (!shop) {
    res.status(404);
    throw new Error('Shop not found');
  }

  // Check for existing review (duplicate prevention)
  const existingReview = await Review.findOne({ user: userId, shop: shopId });
  if (existingReview) {
    res.status(400);
    throw new Error(
      'You have already reviewed this shop. You can edit your existing review instead.'
    );
  }

  // Determine if this is the first review for the shop
  const isFirstReview = shop.reviewCount === 0;
  const pointsEarned = isFirstReview
    ? parseInt(process.env.POINTS_FIRST_REVIEW) || 15
    : parseInt(process.env.POINTS_NORMAL_REVIEW) || 10;

  // Create the review
  const review = await Review.create({
    user: userId,
    shop: shopId,
    rating,
    text,
  });

  // Award points atomically
  await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });

  // Record point transaction
  await PointTransaction.create({
    user: userId,
    type: isFirstReview ? 'FIRST_REVIEW' : 'REVIEW',
    points: pointsEarned,
    description: isFirstReview
      ? `First review on ${shop.name} (bonus!)`
      : `Review on ${shop.name}`,
    shop: shopId,
  });

  // Update shop's average rating
  await updateShopRating(shopId);

  // Populate user info for response
  const populatedReview = await Review.findById(review._id).populate(
    'user',
    'name'
  );

  res.status(201).json({
    review: populatedReview,
    pointsEarned,
    isFirstReview,
    message: isFirstReview
      ? `🎉 First review! You earned ${pointsEarned} bonus points!`
      : `You earned ${pointsEarned} points for your review!`,
  });
});

// @desc    Edit own review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const editReview = asyncHandler(async (req, res) => {
  const { rating, text } = req.body;
  const reviewId = req.params.reviewId;

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Only the author can edit their review
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own reviews');
  }

  // Update fields
  if (rating) {
    if (rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Rating must be between 1 and 5');
    }
    review.rating = rating;
  }
  if (text) {
    review.text = text;
  }

  await review.save();

  // Recalculate shop's average rating
  await updateShopRating(review.shop);

  const populatedReview = await Review.findById(review._id).populate(
    'user',
    'name'
  );

  res.json({
    review: populatedReview,
    message: 'Review updated successfully',
  });
});

// @desc    Get reviews for a shop
// @route   GET /api/reviews/shop/:shopId
// @access  Public
const getShopReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ shop: req.params.shopId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

module.exports = { addReview, editReview, getShopReviews };
