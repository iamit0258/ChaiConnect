/**
 * Generate a random coupon code in format: CHAI-XXXXXX
 * Uses alphanumeric characters (excluding ambiguous ones like 0/O, 1/l)
 *
 * @returns {string} Coupon code e.g. "CHAI-X7K2P9"
 */
const generateCouponCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CHAI-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = { generateCouponCode };
