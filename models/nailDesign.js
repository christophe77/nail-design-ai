/**
 * Nail Design Model
 * Handles business logic for nail design generation
 */

/**
 * Generates a design description and prompt based on input parameters
 * @param {string} skinTone - The skin tone name
 * @param {string} skinToneHex - The skin tone hex color code
 * @param {Array} keywords - Array of keywords for the design
 * @returns {Object} Object containing the prompt and design description
 */
function generateDesign(skinTone, skinToneHex, keywords) {
    if (!skinTone || !skinToneHex || !Array.isArray(keywords) || keywords.length !== 3) {
        throw new Error('Invalid input parameters');
    }
    
    const prompt = `Design an elegant nail art pattern ONLY ON THE NAIL AREA. 
                    The client has ${skinTone} skin tone (hex color: ${skinToneHex}). 
                    The key elements to include in the nail design are: ${keywords.join(', ')}.
                    The design should be simple, elegant, easy with focus on creating a beautiful nail art pattern.
                    IMPORTANT: Only modify the white nail area in the template, keep the background as is.`;

    const description = `A refined nail design for ${skinTone} skin tone (${skinToneHex}), featuring patterns with ${keywords.join(', ')}. Uses harmonious colors and fine details.`;

    return {
        promptUsed: prompt,
        designDescription: description
    };
}

module.exports = {
    generateDesign
}; 