/**
 * Hugging Face Service
 * Handles all API interactions with Hugging Face Inference Providers
 */
const fetch = require('node-fetch');
const config = require('../config/config');

// Regular API key for direct model calls
const API_KEY = config.huggingFaceApiKey;
// Special API key for Inference Providers
const INFERENCE_API_KEY = config.huggingFaceInferenceApiKey;

/**
 * Generates an image using Hugging Face Inference Provider for text-to-image
 * @param {string} prompt - Text prompt for image generation
 * @param {string} skinToneHex - Hex color code for skin tone
 * @returns {Promise<Buffer>} Generated image buffer
 */
async function generateWithTextToImage(prompt, skinToneHex) {
    console.log("Using HF Inference Provider for text-to-image");
    
    const enhancedPrompt = `A close-up photo of a beautiful manicured nail with skin tone color ${skinToneHex}, with nail art. ${prompt}. Professional nail art, beauty photography, macro photography.`;
    
    // Using the standard OpenAI-compatible API format as documented
    const response = await fetch("https://router.huggingface.co/hf-inference/v3/openai/images/generations", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${INFERENCE_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            prompt: enhancedPrompt,
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            n: 1,
            size: "1024x1024",
            provider: "hf-inference"
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`HF Inference Provider Error (${response.status}): ${errorText}`);
        throw new Error(`HF Inference Provider Error: ${response.statusText}`);
    }

    // Parse the response which contains a data URL
    const jsonResponse = await response.json();
    const base64Data = jsonResponse.data[0].url.split(',')[1];
    return Buffer.from(base64Data, 'base64');
}

/**
 * Attempts image-to-image generation with HF Inference Provider
 * @param {string} templateImage - Base64 encoded template image
 * @param {string} prompt - Text prompt for image generation
 * @returns {Promise<Buffer>} Generated image buffer
 */
async function generateWithImageToImage(templateImage, prompt) {
    console.log("Using HF Inference Provider for image-to-image");
    
    const response = await fetch("https://router.huggingface.co/hf-inference/v3/openai/images/edits", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${INFERENCE_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            image: templateImage,
            prompt: "Create beautiful nail art only on the white nail area. " + prompt,
            model: "runwayml/stable-diffusion-v1-5",
            n: 1,
            size: "1024x1024",
            provider: "hf-inference"
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`HF Inference I2I Error (${response.status}): ${errorText}`);
        throw new Error(`HF Inference I2I Error: ${response.statusText}`);
    }

    // Parse the response which contains a data URL
    const jsonResponse = await response.json();
    const base64Data = jsonResponse.data[0].url.split(',')[1];
    return Buffer.from(base64Data, 'base64');
}

/**
 * Attempts direct Hub API call for text-to-image as a fallback
 * @param {string} prompt - Text prompt for image generation
 * @returns {Promise<Buffer>} Generated image buffer
 */
async function generateWithDirectHubAPI(prompt) {
    console.log("Using direct Hub API for text-to-image as fallback");
    
    const response = await fetch(`https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            inputs: prompt,
            options: {
                wait_for_model: true,
                use_gpu: true
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Direct Hub API Error (${response.status}): ${errorText}`);
        throw new Error(`Direct Hub API Error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
}

/**
 * Generates an image using available HF APIs, with fallbacks
 * @param {string} templateImage - Base64 encoded template image
 * @param {string} prompt - Text prompt for image generation
 * @param {string} skinToneHex - Hex color code for skin tone
 * @returns {Promise<string>} Base64 encoded image data
 */
async function generateImage(templateImage, prompt, skinToneHex) {
    try {
        // Try image-to-image with dedicated Inference token first
        const buffer = await generateWithImageToImage(templateImage, prompt);
        return Buffer.from(buffer).toString('base64');
    } catch (i2iError) {
        console.log(`Image-to-image failed: ${i2iError.message}`);
        console.log("Falling back to text-to-image");
        
        try {
            // Try text-to-image with Inference Provider 
            const buffer = await generateWithTextToImage(prompt, skinToneHex);
            return Buffer.from(buffer).toString('base64');
        } catch (inferenceError) {
            console.log(`Inference Provider failed: ${inferenceError.message}`);
            console.log("Falling back to direct Hub API");
            
            // Try direct Hub API as final fallback
            try {
                const enhancedPrompt = `A close-up photo of a beautiful manicured nail with skin tone color ${skinToneHex}, with nail art. ${prompt}. Professional nail art, beauty photography, macro photography.`;
                const buffer = await generateWithDirectHubAPI(enhancedPrompt);
                return Buffer.from(buffer).toString('base64');
            } catch (directError) {
                console.log(`Direct Hub API also failed: ${directError.message}`);
                throw directError; // Let the controller handle this with its mock service
            }
        }
    }
}

module.exports = {
    generateImage,
    generateWithTextToImage,
    generateWithImageToImage,
    generateWithDirectHubAPI
};