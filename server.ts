import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// In-memory store for cloud sync simulation across sessions
let cloudDatabase: {
  stamps: any[];
  categories: any[];
  lastUpdated: string;
} = {
  stamps: [],
  categories: [],
  lastUpdated: new Date().toISOString(),
};

// Initialize Gemini Client server-side
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Cloud Sync endpoints
app.get("/api/sync", (req, res) => {
  res.json({
    success: true,
    data: cloudDatabase,
  });
});

app.post("/api/sync", (req, res) => {
  const { stamps, categories } = req.body;
  if (Array.isArray(stamps)) cloudDatabase.stamps = stamps;
  if (Array.isArray(categories)) cloudDatabase.categories = categories;
  cloudDatabase.lastUpdated = new Date().toISOString();

  res.json({
    success: true,
    lastUpdated: cloudDatabase.lastUpdated,
    stampsCount: cloudDatabase.stamps.length,
  });
});

// AI Endpoint to generate vintage Japanese stamp metadata
app.post("/api/stamp-ai", async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY not configured",
        fallback: {
          title: "Recuerdo Sin Título",
          kanjiTitle: "記憶",
          denomination: "¥80",
          postmarkCity: "TOKYO",
          suggestedFilter: "sepia",
          poeticNote: "Un momento detenido en el tiempo.",
        },
      });
    }

    const { prompt, imageBase64 } = req.body;

    const parts: any[] = [];
    if (imageBase64) {
      // Remove header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    parts.push({
      text: `Analiza esta fotografía/descripción (${prompt || "Momento diario"}) y genera los metadatos para convertirla en una estampilla postal vintage japonesa retro minimalista.
Responde únicamente con un objeto JSON válido con la siguiente estructura:
- suggestedTitle: Título poético y breve en español (máximo 4 palabras).
- kanjiTitle: Traducción o concepto equivalente en kanji japonés (1 a 4 caracteres).
- denomination: Valor facial vintage (ej. "¥80", "¥120", "¥200", "2026").
- postmarkCity: Nombre de ciudad o concepto para el matasellos (ej. "TOKYO", "KYOTO", "SANTIAGO", "NIPPON").
- suggestedFilter: Uno de estos estilos: "sepia", "halftone", "ukiyoe", "risograph", "monochrome", "watercolor", "retroGrain".
- poeticNote: Una breve reflexión estilo haiku o poesía japonesa en español (1-2 oraciones cortas).`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            kanjiTitle: { type: Type.STRING },
            denomination: { type: Type.STRING },
            postmarkCity: { type: Type.STRING },
            suggestedFilter: { type: Type.STRING },
            poeticNote: { type: Type.STRING },
          },
          required: [
            "suggestedTitle",
            "kanjiTitle",
            "denomination",
            "postmarkCity",
            "suggestedFilter",
            "poeticNote",
          ],
        },
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Error in stamp-ai endpoint:", err);
    return res.json({
      success: false,
      error: err.message,
      fallback: {
        suggestedTitle: "Memoria del Día",
        kanjiTitle: "日 記",
        denomination: "¥80",
        postmarkCity: "TOKYO",
        suggestedFilter: "sepia",
        poeticNote: "Capturado en el fluir del tiempo cotidiano.",
      },
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Kitteki Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start();
