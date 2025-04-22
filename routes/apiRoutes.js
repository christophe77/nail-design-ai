/**
 * API Routes
 * Defines API routes for the application
 */
const express = require('express');
const router = express.Router();
const nailDesignController = require('../controllers/nailDesignController');
const imageController = require('../controllers/imageController');

// Nail design generation endpoint
router.post('/generate-nail-design', nailDesignController.generateNailDesign);

// Image generation endpoint
router.post('/generate-image', imageController.generateImage);

module.exports = router; 