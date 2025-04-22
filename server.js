/**
 * Main server file for Nail Design AI application
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config/config');
const apiRoutes = require('./routes/apiRoutes');

// Initialize express app
const app = express();

// Set up middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up API routes
app.use('/api', apiRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('index', { title: 'Nail Design AI' });
});

// Backward compatibility routes
app.post('/generate-nail-design', (req, res) => {
    // Forward to the new API endpoint
    res.redirect(307, '/api/generate-nail-design');
});

app.post('/generate-image', (req, res) => {
    // Forward to the new API endpoint
    res.redirect(307, '/api/generate-image');
});

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 