const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5001;

// Enable CORS to allow frontend to access the backend
app.use(cors());

// Serve static files (like CSS, JS, and images) from the /server directory
app.use(express.static(path.join(__dirname))); // This will serve index.html, app.js, styles.css

// Serve the sounds (MP3 files) from the /sounds directory
app.use('/sounds', express.static(path.join(__dirname, '..', 'sounds')));

// Test route to check if the server is running
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html from the /server folder
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
