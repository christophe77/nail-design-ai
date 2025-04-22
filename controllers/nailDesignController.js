/**
 * Nail Design Controller
 * Handles requests related to nail design generation
 */
const nailDesignModel = require('../models/nailDesign');

/**
 * Handle nail design generation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateNailDesign(req, res) {
    try {
        const { skinTone, skinToneHex, keywords } = req.body;

        // Validate input
        if (!skinTone || !skinToneHex || !Array.isArray(keywords) || keywords.length !== 3) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        // Generate design using the model
        const designData = nailDesignModel.generateDesign(skinTone, skinToneHex, keywords);
        
        // Return the result
        res.json(designData);
    } catch (error) {
        console.error('Error generating nail design:', error);
        res.status(500).json({ error: 'Failed to generate design', details: error.message });
    }
}

module.exports = {
    generateNailDesign
}; 