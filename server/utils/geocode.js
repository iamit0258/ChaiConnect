const fetch = require('node-fetch');

/**
 * Geocode an address to lat/lng coordinates using Nominatim (OpenStreetMap).
 * This runs server-side so users don't need to enter coordinates manually.
 *
 * @param {string} address - Human-readable address
 * @returns {Object} { lat, lng } or throws error if no results
 */
const geocodeAddress = async (address) => {
  if (!address || address.trim().length === 0) {
    const error = new Error('Address is required for geocoding');
    error.statusCode = 400;
    throw error;
  }

  const encodedAddress = encodeURIComponent(address.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ChaiConnect/1.0 (chai-shop-discovery-app)',
    },
  });

  if (!response.ok) {
    const error = new Error('Geocoding service unavailable. Please try again later.');
    error.statusCode = 503;
    throw error;
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    const error = new Error(
      'Could not find coordinates for this address. Please enter a more specific address.'
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
};

/**
 * Get directions/route between two points using OSRM.
 *
 * @param {number} startLng - Start longitude
 * @param {number} startLat - Start latitude
 * @param {number} endLng - End longitude
 * @param {number} endLat - End latitude
 * @returns {Object} Route data with geometry, distance, duration
 */
const getDirections = async (startLng, startLat, endLng, endLat) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error('Directions service unavailable. Please try again later.');
    error.statusCode = 503;
    throw error;
  }

  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    const error = new Error('No route found between these locations.');
    error.statusCode = 400;
    throw error;
  }

  const route = data.routes[0];

  return {
    geometry: route.geometry,
    distance: route.distance, // meters
    duration: route.duration, // seconds
    steps: route.legs[0].steps.map((step) => ({
      instruction: step.maneuver.type,
      distance: step.distance,
      duration: step.duration,
    })),
  };
};

module.exports = { geocodeAddress, getDirections };
