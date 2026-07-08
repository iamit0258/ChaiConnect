const express = require('express');
const {
  getShops,
  getShopById,
  addShop,
  getShopDirections,
} = require('../controllers/shopController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getShops);
router.get('/:id', getShopById);
router.post('/', protect, addShop);
router.post('/directions', getShopDirections);

module.exports = router;
