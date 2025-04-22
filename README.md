# Nail Design AI

An AI-powered web application for generating unique nail design images based on user input.

## Features

- Generate personalized nail designs with AI
- Select from different skin tones for accurate visualization
- Add custom keywords to influence the design
- Progressive Web App (PWA) support for mobile devices
- Multi-level fallback system for reliable image generation
- MVC architecture for maintainable code organization

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript
- **Image Generation**: Hugging Face Inference Providers
- **View Engine**: EJS
- **Architecture**: MVC Pattern

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- NPM (v6 or later)
- Hugging Face API tokens (standard and inference-specific)

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/nail-design-ai.git
   cd nail-design-ai
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Hugging Face API tokens:

   ```
   HF_API_TOKEN=your_standard_api_token_here
   HF_API_TOKEN_INFERENCE=your_inference_api_token_here
   PORT=3000
   ```

   > **Note**: To use Hugging Face Inference Providers, you need to create a fine-grained token with the "Make calls to Inference Providers" scope in your Hugging Face account settings.

4. Start the server

   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
nail-design-ai/
├── config/              # Configuration files
├── controllers/         # Route controllers
├── models/              # Data models
├── public/              # Static assets
│   ├── templates/       # Template images
│   ├── style.css        # Styles
│   └── app.js           # Frontend JavaScript
├── routes/              # API routes
├── services/            # External service integrations
├── views/               # EJS templates
├── server.js            # Main application entry point
└── package.json         # Project metadata and dependencies
```

## How It Works

1. User selects skin tone and enters keywords
2. Application generates a design description based on input
3. The description is used to generate a visual nail design using three methods (in order):
   - Image-to-image transformation using Hugging Face Inference Providers
   - Text-to-image generation using Hugging Face Inference Providers
   - Direct model API call to Hugging Face Hub as fallback
   - Local mock service when all API attempts fail (development mode)

## API Integration

This application uses Hugging Face's Inference Providers system for AI image generation. The implementation includes:

- OpenAI-compatible endpoints for image generation
- Image-to-image edits using nail templates
- Text-to-image generation for maximum flexibility
- Cascading fallback system for reliability

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Hugging Face for providing the Inference Providers API
- Various AI models used for image generation
