const Shop = require('../models/Shop');
const { asyncHandler } = require('../middleware/errorHandler');
const { geocodeAddress, getDirections } = require('../utils/geocode');

// @desc    Get all shops (with optional search/filter)
// @route   GET /api/shops
// @access  Public
const getShops = asyncHandler(async (req, res) => {
  const { search, minRating, sortBy } = req.query;

  let query = {};

  // Search by name or address
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { address: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  // Filter by minimum rating
  if (minRating) {
    const rating = parseFloat(minRating);
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      query.averageRating = { $gte: rating };
    }
  }

  // Sort options
  let sort = { createdAt: -1 }; // Default: newest first
  if (sortBy === 'rating') {
    sort = { averageRating: -1, reviewCount: -1 };
  } else if (sortBy === 'nearest' && req.query.lat && req.query.lng) {
    // If user location provided, sort by nearest
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      const shops = await Shop.aggregate([
        { $match: query },
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            spherical: true,
          },
        },
      ]);
      return res.json(shops);
    }
  }

  const shops = await Shop.find(query)
    .sort(sort)
    .populate('addedBy', 'name');

  res.json(shops);
});

// @desc    Get single shop by ID
// @route   GET /api/shops/:id
// @access  Public
const getShopById = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id).populate('addedBy', 'name');

  if (!shop) {
    res.status(404);
    throw new Error('Shop not found');
  }

  res.json(shop);
});

// @desc    Add a new shop
// @route   POST /api/shops
// @access  Private
const addShop = asyncHandler(async (req, res) => {
  const { name, address, description, photoUrl } = req.body;

  if (!name || !address) {
    res.status(400);
    throw new Error('Shop name and address are required');
  }

  // Server-side geocoding — convert address to lat/lng
  const { lat, lng } = await geocodeAddress(address);

  const shop = await Shop.create({
    name,
    address,
    description: description || '',
    photoUrl: photoUrl || '',
    location: {
      type: 'Point',
      coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
    },
    addedBy: req.user._id,
  });

  res.status(201).json(shop);
});

// @desc    Get directions between two points
// @route   POST /api/shops/directions
// @access  Public
const getShopDirections = asyncHandler(async (req, res) => {
  const { startLat, startLng, endLat, endLng, startAddress } = req.body;

  let sLat = parseFloat(startLat);
  let sLng = parseFloat(startLng);

  // If start coordinates not provided, geocode the start address
  if ((!sLat || !sLng || isNaN(sLat) || isNaN(sLng)) && startAddress) {
    const geocoded = await geocodeAddress(startAddress);
    sLat = geocoded.lat;
    sLng = geocoded.lng;
  }

  const eLat = parseFloat(endLat);
  const eLng = parseFloat(endLng);

  if (isNaN(sLat) || isNaN(sLng) || isNaN(eLat) || isNaN(eLng)) {
    res.status(400);
    throw new Error(
      'Valid start and end coordinates are required. Provide coordinates or a start address.'
    );
  }

  const route = await getDirections(sLng, sLat, eLng, eLat);

  res.json({
    ...route,
    start: { lat: sLat, lng: sLng },
    end: { lat: eLat, lng: eLng },
  });
});

module.exports = { getShops, getShopById, addShop, getShopDirections };
