const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection (Database ka naam cluster_bot_db2 set kiya gaya hai)
const MONGO_URI = process.env.MONGO_URI || "Aapka_MongoDB_URL_Yaha_Hoga";

mongoose.connect(MONGO_URI, {
    dbName: 'cluster_bot_db2',
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected Successfully to cluster_bot_db2!"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Mongoose Schema & Model for 'tokan' collection (folder)
const tokenSchema = new mongoose.Schema({
    tokan: { type: String, required: true, unique: true },
    status: { type: String, default: 'unused' }
});

const TokenModel = mongoose.model('tokan', tokenSchema);

// API Endpoint jo frontend se random token receive karke database me save karega
app.post('/api/save-token', async (req, res) => {
    try {
        const { tokan } = req.body;
        if (!tokan) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        // Check karo ki token pehle se toh nahi hai
        const existingToken = await TokenModel.findOne({ tokan });
        if (!existingToken) {
            const newToken = new TokenModel({
                tokan: tokan,
                status: 'unused'
            });
            await newToken.save();
            return res.status(201).json({ success: true, message: "Token saved successfully!" });
        }

        res.status(200).json({ success: true, message: "Token already exists." });
    } catch (error) {
        console.error("Error saving token:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
