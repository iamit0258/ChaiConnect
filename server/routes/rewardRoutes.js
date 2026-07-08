const express = require('express');
const {
  getBalance,
  redeemCoupon,
  getLeaderboard,
} = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/balance', protect, getBalance);
router.post('/redeem', protect, redeemCoupon);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
