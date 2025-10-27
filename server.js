// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import { analyzeNews } from "./aiModel.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ Your API keys
const GNEWS_API_KEY = "ok62f125243861dd678378fe5d67d8b6b3";
const FACTCHECK_API_KEY = "pkAIzaSyC5nTfgTMgkyaoN-RhRlQPDdevpvC9f9EQ";

// Helper to clean query text
function cleanQuery(text) {
  return text
    .replace(/https?:\/\/\S+/g, "")          // remove URLs
    .replace(/www\.\S+/g, "")                // remove www links
    .replace(/Read more at:.*/gi, "")        // remove “Read more at”
    .replace(/utm_\w+=\w+/g, "")             // remove tracking parameters
    .replace(/[^a-zA-Z0-9\s]/g, "")          // remove punctuation/special chars
    .split(" ")
    .filter(w => w.length > 2)               // remove tiny words
    .slice(0, 10)                            // limit to 10 main words
    .join(" ")
    .trim();
}

// =======================
// VERIFY ROUTE
// =======================
app.post("/verify", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "News text is required" });

  const aiResult = analyzeNews(text);
  console.log("🧠 AI Result:", aiResult);

  let realNews = [];
  let factChecks = [];

  if (aiResult.label === "Fake" || aiResult.label === "Partially True") {
    const query = cleanQuery(text);
    console.log("🔍 Cleaned Query:", query);

    // 📰 GNews API
    const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=3&apikey=${GNEWS_API_KEY}`;
    console.log("🌐 GNews URL:", gnewsUrl);

    try {
      const response = await fetch(gnewsUrl);
      const data = await response.json();
      console.log("🟢 GNews Data:", data);

      if (data.articles && data.articles.length > 0) {
        realNews = data.articles.map(article => ({
          title: article.title,
          source: article.source.name,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt,
        }));
      } else {
        console.warn("⚠️ No real news found or query too recent (GNews delay).");
      }
    } catch (error) {
      console.error("❌ Error fetching GNews:", error);
    }

    // 🔎 Google Fact Check API
    const factUrl = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&key=${FACTCHECK_API_KEY}`;
    console.log("🌍 FactCheck URL:", factUrl);

    try {
      const resFact = await fetch(factUrl);
      const dataFact = await resFact.json();
      console.log("🟣 FactCheck Data:", dataFact);

      if (dataFact.claims && dataFact.claims.length > 0) {
        factChecks = dataFact.claims.map(c => ({
          text: c.text,
          claimant: c.claimant,
          publisher: c.claimReview?.[0]?.publisher?.name,
          title: c.claimReview?.[0]?.title,
          rating: c.claimReview?.[0]?.textualRating,
          url: c.claimReview?.[0]?.url,
        }));
      } else {
        console.warn("⚠️ No fact checks found for this topic.");
      }
    } catch (error) {
      console.error("❌ Error fetching Fact Check data:", error);
    }
  }

  res.json({
    aiResult,
    realNews,
    factChecks,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Fake News Verifier running on http://localhost:${PORT}`);
});
