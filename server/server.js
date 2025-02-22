const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5001;

// Enable CORS to allow frontend to access the backend
app.use(cors());

// Serve static files (MP3 sounds)
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

// Test route to check if the server is running
app.get("/", (req, res) => {
    res.send("Virtual Piano Backend is Running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

