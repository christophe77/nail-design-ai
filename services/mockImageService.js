/**
 * Mock Image Service
 * Local fallback when Hugging Face API is unavailable
 */
const fs = require('fs');
const path = require('path');

/**
 * Creates a simple image fallback when APIs are down
 * @param {string} skinTone - The skin tone descriptor for personalization
 * @returns {Promise<string>} Base64 encoded image data
 */
async function generateMockImage(skinTone = 'medium') {
    console.log("Using mock image generation service");
    
    // Try multiple locations for a sample image
    const possiblePaths = [
        path.join(process.cwd(), 'public', 'sample-nail.png'),
        path.join(process.cwd(), 'public', 'templates', 'files', `nail-template-${skinTone.replace(' ', '-')}.png`),
        path.join(process.cwd(), 'public', 'assets', 'sample-nail.png')
    ];
    
    // Try each path
    for (const imagePath of possiblePaths) {
        try {
            if (fs.existsSync(imagePath)) {
                console.log(`Found sample image at: ${imagePath}`);
                const imageBuffer = await fs.promises.readFile(imagePath);
                return imageBuffer.toString('base64');
            }
        } catch (error) {
            console.log(`Error reading ${imagePath}: ${error.message}`);
            // Continue to next path
        }
    }
    
    // If no image found, return a colored gradient
    console.log("No sample images found, creating mock image");
    return createGradientNailImage();
}

/**
 * Creates a gradient nail-like image as the absolute fallback
 * @returns {string} Base64 encoded data URI for a simple gradient nail image
 */
function createGradientNailImage() {
    // This is a string representation of a simple SVG with a pink-to-purple gradient
    // that vaguely resembles a nail design
    const svgContent = `
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff9eb5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d471e5;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g>
        <rect x="75" y="50" rx="60" ry="120" width="150" height="220" fill="url(#nailGradient)" />
        <text x="150" y="150" font-family="Arial" font-size="12" text-anchor="middle" fill="white">API Unavailable</text>
        <text x="150" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="white">Mock Nail Image</text>
      </g>
    </svg>`;
    
    // Convert SVG to base64
    return Buffer.from(svgContent).toString('base64');
}

module.exports = {
    generateMockImage
}; 