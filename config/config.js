/**
 * Configuration
 * Application-wide configuration settings
 */
require('dotenv').config();

module.exports = {
    // Server settings
    port: process.env.PORT || 3000,
    
    // API keys
    huggingFaceApiKey: process.env.HF_API_TOKEN,
    huggingFaceInferenceApiKey: process.env.HF_API_TOKEN_INFERENCE,
    
    // Models for Inference Providers
    models: {
        // HF Inference Provider models
        textToImage: "stabilityai/stable-diffusion-xl-base-1.0",
        imageToImage: "runwayml/stable-diffusion-v1-5"
    },
    
    // Template paths
    templates: {
        basePath: "public/templates/files"
    }
}; 