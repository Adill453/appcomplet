import express from 'express';
import cors from 'cors';
//import { config } from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import studentRoutes from './routes/studentRoutes.js';

import dotenv from 'dotenv';
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI|| 'mongodb+srv://adil:adilkhan453@cluster0.ff52xin.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/students', studentRoutes);

// Fallback route for SPA
{/*app.get('/*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
}); */}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});