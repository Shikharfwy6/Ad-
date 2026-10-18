const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

// Cached connection for Vercel Serverless
let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    if (MONGO_URI) {
        await mongoose.connect(MONGO_URI, {
            dbName: 'cluster_bot_db2'
        });
        isConnected = true;
        console.log("MongoDB Connected to cluster_bot_db2");
    }
}

// Mongoose Schema & Model for 'tokan' collection
const tokenSchema = new mongoose.Schema({
    tokan: { type: String, required: true, unique: true },
    status: { type: String, default: 'unused' }
});

const TokenModel = mongoose.models.tokan || mongoose.model('tokan', tokenSchema);

// API Endpoint: /api/save-token
app.post('/api/save-token', async (req, res) => {
    try {
        await connectDB();
        const { tokan } = req.body;
        if (!tokan) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        const existingToken = await TokenModel.findOne({ tokan });
        if (!existingToken) {
            const newToken = new TokenModel({
                tokan: tokan,
                status: 'unused'
            });
            await newToken.save();
            return res.status(201).json({ success: true, message: "Token saved successfully!" });
        }

        return res.status(200).json({ success: true, message: "Token already exists." });
    } catch (error) {
        console.error("Error saving token:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;
