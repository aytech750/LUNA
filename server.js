// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 3001;

const DEEPGRAM_API_KEY = "02a5013c9517d6a41a7c9b76ad5c8af92eccf994"; // <-- Replace with your real key

// CORS config
app.use(cors({
  origin: "*", // Allow all origins (for local dev). In prod, set to your domain.
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// API route for Deepgram analysis
app.post("/api/analyze_deepgram", async (req, res) => {
  try {
    const { audio_url } = req.body;
    if (!audio_url) {
      return res.status(400).json({ error: "Missing audio_url" });
    }

    const dgRes = await fetch(`https://api.deepgram.com/v1/listen`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: audio_url,
        model: "nova",
        emotion: true
      })
    });

    const dgData = await dgRes.json();
    console.log("Deepgram response:", JSON.stringify(dgData, null, 2));

    // Extract emotion if available
    let mood = "neutral";
    try {
      mood = dgData.results.channels[0].alternatives[0].emotion || "neutral";
    } catch (e) { /* fallback to neutral */ }

    res.json({ mood, deepgramRaw: dgData });

  } catch (err) {
    console.error("Error analyzing audio:", err);
    res.status(500).json({ error: "Analysis failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
