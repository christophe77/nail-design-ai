import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Generate prompt + design description
app.post('/generate-nail-design', (req, res) => {
    const { skinTone, skinToneHex, keywords } = req.body;

    if (!skinTone || !skinToneHex || !Array.isArray(keywords) || keywords.length !== 3) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const prompt = `Design an elegant nail art pattern ONLY ON THE NAIL AREA. 
                    The client has ${skinTone} skin tone (hex color: ${skinToneHex}). 
                    The key elements to include in the nail design are: ${keywords.join(', ')}.
                    The design should be simple, elegant, easywith focus on creating a beautiful nail art pattern.
                    IMPORTANT: Only modify the white nail area in the template, keep the background as is.`;

    const description = `A refined nail design for ${skinTone} skin tone (${skinToneHex}), featuring patterns with ${keywords.join(', ')}. Uses harmonious colors and fine details.`;

    res.json({ promptUsed: prompt, designDescription: description });
});

// Call Hugging Face to generate image
app.post('/generate-image', async (req, res) => {
    const { prompt, skinTone, skinToneHex } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        console.log(`Generating image with prompt: ${prompt}`);
        
        // Read the template image matching the skin tone
        const templateFileName = skinTone ? 
            `nail-template-${skinTone.replace(' ', '-')}.png` : 
            'nail-template-medium.png'; // default
            
        const templatePath = path.join(__dirname, 'public', 'templates', 'files', templateFileName);
        console.log(`Looking for template: ${templatePath}`);
        
        let templateImage;
        
        try {
            templateImage = await fs.promises.readFile(templatePath);
            // Convert to base64 for API
            templateImage = `data:image/png;base64,${templateImage.toString('base64')}`;
            console.log("Template image loaded successfully");
        } catch (err) {
            console.error('Error reading template image:', err);
            console.log('Template not found, using text-to-image generation...');
            return textToImageFallback(prompt, res);
        }
        
        // Try the Instruct Pix2Pix model which is known to work with the free API
        console.log("Using Instruct Pix2Pix model for image editing");
        const response = await fetch("https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                inputs: {
                    image: templateImage,
                    prompt: "Create beautiful nail art only on the white nail area in this image. Do not modify the background.",
                    image_guidance_scale: 1.5,  // Higher values preserve more of the original image
                    guidance_scale: 7.0
                }
            })
        });

        // Check if the response was successful
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}): ${errorText}`);
            
            console.log("Falling back to controlnet model...");
            return tryControlNet(templateImage, prompt, skinToneHex, res);
        }

        // Get the binary data
        const buffer = await response.arrayBuffer();
        
        // Convert to base64
        const base64Image = Buffer.from(buffer).toString('base64');
        
        // Send the response
        res.json({ image: `data:image/png;base64,${base64Image}` });
        
    } catch (err) {
        console.error('Error generating image:', err);
        res.status(500).json({ error: 'Image generation failed', details: err.message });
    }
});

// Try using ControlNet for better template control
async function tryControlNet(templateImage, prompt, skinToneHex, res) {
    try {
        console.log("Trying ControlNet canny model");
        // ControlNet with canny edge detection
        const response = await fetch("https://api-inference.huggingface.co/models/lllyasviel/sd-controlnet-canny", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                inputs: {
                    image: templateImage,
                    prompt: prompt + " Focus only on creating nail art in the white nail area."
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`ControlNet API Error (${response.status}): ${errorText}`);
            
            // One more attempt with dreamlike-photoreal model
            return tryDreamlikePhotoreal(prompt, skinToneHex, res);
        }

        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        res.json({ image: `data:image/png;base64,${base64Image}` });
    } catch (err) {
        console.error('ControlNet error:', err);
        return tryDreamlikePhotoreal(prompt, skinToneHex, res);
    }
}

// Try using a photo-realistic model as final attempt
async function tryDreamlikePhotoreal(prompt, skinToneHex, res) {
    try {
        console.log("Trying dreamlike-photoreal model");
        // Use a photorealistic model
        const enhancedPrompt = `A close-up photo of a beautiful manicured nail with skin tone color ${skinToneHex}, with nail art design that includes ${prompt.split('key elements to include')[1].split('.')[0]}. Professional nail art, beauty photography, macro photography.`;
        
        const response = await fetch("https://api-inference.huggingface.co/models/dreamlike-art/dreamlike-photoreal-2.0", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                inputs: enhancedPrompt,
                options: {
                    wait_for_model: true
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Dreamlike API Error (${response.status}): ${errorText}`);
            return textToImageFallback(prompt, res);
        }

        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        res.json({ image: `data:image/png;base64,${base64Image}` });
    } catch (err) {
        console.error('Dreamlike model error:', err);
        return textToImageFallback(prompt, res);
    }
}

// Fallback to text-to-image if image-to-image is not available
async function textToImageFallback(prompt, res) {
    try {
        console.log("Using text-to-image fallback");
        const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
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
            console.error(`Fallback API Error (${response.status}): ${errorText}`);
            return openJourneyFallback(prompt, res);
        }

        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        res.json({ image: `data:image/png;base64,${base64Image}` });
    } catch (err) {
        console.error('Fallback error:', err);
        return openJourneyFallback(prompt, res);
    }
}

// Final fallback to openjourney model if SDXL is not available
async function openJourneyFallback(prompt, res) {
    try {
        console.log("Using openjourney final fallback");
        const response = await fetch("https://api-inference.huggingface.co/models/prompthero/openjourney", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                inputs: prompt,
                options: { wait_for_model: true }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Fallback API Error (${response.status}): ${errorText}`);
            return res.status(response.status).json({ 
                error: `Image generation failed: ${response.statusText}`,
                details: errorText
            });
        }

        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        res.json({ image: `data:image/png;base64,${base64Image}` });
    } catch (err) {
        console.error('Fallback error:', err);
        res.status(500).json({ error: 'Image generation failed', details: err.message });
    }
}

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
