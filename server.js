import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(cors({ origin: "*" }));

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

app.get("/cloudinary-images", async (req, res) => {
  console.log("Fetching Cloudinary images...");
  const folder = req.query.folder;
  console.log(folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expression: `folder:${folder}` }),
    });

    if (!response.ok) {
      throw new Error(`Cloudinary API Error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data.resources);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: error.message });
  }
});

// Servirea fișierelor statice din frontend (build)
app.use(express.static(path.join(__dirname, "../build"))); // Dacă build-ul este în "public"

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
