/**
 * Image Generation Model
 * Handles image generation logic for nail designs
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Gets the template path based on skin tone
 * @param {string} skinTone - The skin tone name
 * @returns {string} Path to the template image
 */
function getTemplatePath(skinTone) {
    const templateFileName = skinTone ? 
        `nail-template-${skinTone.replace(' ', '-')}.png` : 
        'nail-template-medium.png';
    
    return path.join(process.cwd(), config.templates.basePath, templateFileName);
}

/**
 * Loads a template image from file system
 * @param {string} templatePath - Path to the template image
 * @returns {Promise<string>} Base64-encoded image data
 */
async function loadTemplateImage(templatePath) {
    try {
        const imageBuffer = await fs.promises.readFile(templatePath);
        return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        throw new Error(`Failed to load template image: ${error.message}`);
    }
}

module.exports = {
    getTemplatePath,
    loadTemplateImage
}; 