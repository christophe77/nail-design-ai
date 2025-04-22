/**
 * Image Controller
 * Handles requests related to image generation
 */
const imageGenerationModel = require('../models/imageGeneration');
const huggingfaceService = require('../services/huggingfaceService');
const mockImageService = require('../services/mockImageService');

/**
 * Handle image generation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateImage(req, res) {
    try {
        const { prompt, skinTone, skinToneHex } = req.body;

        // Validate input
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`Generating image with prompt: ${prompt}`);
        
        // Get template path from model
        const templatePath = imageGenerationModel.getTemplatePath(skinTone);
        console.log(`Looking for template: ${templatePath}`);
        
        try {
            // Load template image
            const templateImage = await imageGenerationModel.loadTemplateImage(templatePath);
            console.log("Template image loaded successfully");
            
            try {
                // Try to generate image using Hugging Face service
                const base64Image = await huggingfaceService.generateImage(templateImage, prompt, skinToneHex);
                
                // Return the result
                return res.json({ image: `data:image/png;base64,${base64Image}` });
            } catch (huggingfaceError) {
                console.error(`Hugging Face API error: ${huggingfaceError.message}`);
                console.log("All API attempts failed, falling back to mock service");
                
                // Fall back to mock service when all API attempts fail
                const mockImage = await mockImageService.generateMockImage(skinTone);
                return res.json({ 
                    image: `data:image/png;base64,${mockImage}`,
                    warning: "API services unavailable. Using mock image for development."
                });
            }
            
        } catch (templateError) {
            console.error(`Template error: ${templateError.message}`);
            
            // If template fails, try text-to-image approach
            console.log("Attempting text-to-image generation due to template error");
            const textPrompt = `A close-up photo of a beautiful manicured nail with ${skinTone} skin tone (${skinToneHex}). Professional nail art, beauty photography.`;
            
            try {
                const base64Image = await huggingfaceService.generateWithTextToImage(textPrompt, skinToneHex);
                return res.json({ image: `data:image/png;base64,${base64Image}` });
            } catch (fallbackError) {
                console.error(`Text-to-image failed: ${fallbackError.message}`);
                
                // Last resort - mock image
                console.log("All API attempts failed, using mock image");
                const mockImage = await mockImageService.generateMockImage(skinTone);
                return res.json({ 
                    image: `data:image/png;base64,${mockImage}`,
                    warning: "API services unavailable. Using mock image for development."
                });
            }
        }
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Image generation failed', details: error.message });
    }
}

module.exports = {
    generateImage
}; 