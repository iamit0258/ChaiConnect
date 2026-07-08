const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateCouponCode } = require('../utils/coupon');

// @desc    Get user's point balance and transaction history
// @route   GET /api/rewards/balance
// @access  Private
const getBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const transactions = await PointTransaction.find({ user: req.user._id })
    .populate('shop', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

  const redemptionCost = parseInt(process.env.POINTS_REDEMPTION_COST) || 50;

  res.json({
    points: user.points,
    canRedeem: user.points >= redemptionCost,
    redemptionCost,
    transactions,
  });
});

// @desc    Redeem points for a coupon code
// @route   POST /api/rewards/redeem
// @access  Private
const redeemCoupon = asyncHandler(async (req, res) => {
  const redemptionCost = parseInt(process.env.POINTS_REDEMPTION_COST) || 50;

  // SERVER-SIDE balance check — critical for security
  const user = await User.findById(req.user._id);

  if (user.points < redemptionCost) {
    res.status(400);
    throw new Error(
      `Not enough points. You have ${user.points} points but need ${redemptionCost} to redeem a coupon.`
    );
  }

  // Generate coupon code
  const couponCode = generateCouponCode();

  // Deduct points atomically using $inc
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      points: { $gte: redemptionCost }, // Double-check in atomic operation (race condition guard)
    },
    { $inc: { points: -redemptionCost } },
    { new: true }
  );

  if (!updatedUser) {
    res.status(400);
    throw new Error('Could not redeem coupon. Insufficient points.');
  }

  // Record the transaction
  await PointTransaction.create({
    user: req.user._id,
    type: 'REDEMPTION',
    points: -redemptionCost,
    description: `Coupon redeemed: ${couponCode}`,
    couponCode,
  });

  res.json({
    couponCode,
    pointsDeducted: redemptionCost,
    remainingPoints: updatedUser.points,
    message: `🎉 Coupon unlocked! Your code is ${couponCode}`,
  });
});

// @desc    Get leaderboard (top point earners)
// @route   GET /api/rewards/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
  // Aggregate total points earned (not current balance) for a fair leaderboard
  const leaderboard = await PointTransaction.aggregate([
    { $match: { points: { $gt: 0 } } }, // Only earning transactions
    {
      $group: {
        _id: '$user',
        totalEarned: { $sum: '$points' },
        reviewCount: { $sum: 1 },
      },
    },
    { $sort: { totalEarned: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        totalEarned: 1,
        reviewCount: 1,
        currentPoints: '$user.points',
      },
    },
  ]);

  res.json(leaderboard);
});

module.exports = { getBalance, redeemCoupon, getLeaderboard };
