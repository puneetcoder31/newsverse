// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { analyzeNews } = require("./aiModel");
const { logToBlockchain, getBlockchainRecords } = require("./blockchain");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Route for news prediction
app.post("/verify", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "News text is required." });

  const aiResult = analyzeNews(text);
  const blockchainRecord = logToBlockchain(text, aiResult);

  res.json({
    message: "Verification complete",
    aiResult,
    blockchainRecord
  });
});

// Route to see blockchain history (for Transparency Dashboard)
app.get("/ledger", (req, res) => {
  res.json(getBlockchainRecords());
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Fake News Verifier running on http://localhost:${PORT}`)
);
