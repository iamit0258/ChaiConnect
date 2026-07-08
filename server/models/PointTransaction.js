const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['REVIEW', 'FIRST_REVIEW', 'REDEMPTION'],
      required: true,
    },
    points: {
      type: Number,
      required: true, // Positive for earning, negative for spending
    },
    description: {
      type: String,
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    couponCode: {
      type: String, // Only for REDEMPTION type
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups by user
pointTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);
