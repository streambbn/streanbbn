import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // HLS Proxy Route to bypass CORS and Referer restrictions
  app.get("/api/proxy", async (req, res) => {
    const targetUrlParam = req.query.url as string;
    if (!targetUrlParam) {
      res.status(400).send("Missing 'url' query parameter");
      return;
    }

    try {
      const targetUrl = new URL(targetUrlParam);
      
      let referer = `${targetUrl.protocol}//${targetUrl.hostname}/`;
      if (targetUrl.hostname.includes("sooplive")) {
        referer = "https://www.sooplive.com/";
      } else if (targetUrl.hostname.includes("afreecatv")) {
        referer = "https://www.afreecatv.com/";
      }

      const response = await fetch(targetUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Referer": referer,
          "Origin": referer.slice(0, -1),
          "Accept": "*/*"
        }
      });

      if (!response.ok) {
        res.status(response.status).send(`Upstream server returned status ${response.status}`);
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      const isM3u8 = targetUrl.pathname.endsWith(".m3u8") || 
                     contentType.includes("mpegurl") || 
                     contentType.includes("x-mpegurl");

      if (isM3u8) {
        const text = await response.text();
        const lines = text.split(/\r?\n/);
        const rewrittenLines = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) {
            if (trimmed.startsWith("#EXT-X-KEY:") && trimmed.includes('URI="')) {
              return trimmed.replace(/URI="([^"]+)"/, (_match, keyUri) => {
                const absKeyUri = new URL(keyUri, targetUrl).toString();
                return `URI="/api/proxy?url=${encodeURIComponent(absKeyUri)}"`;
              });
            }
            return line;
          }

          try {
            const absoluteSegmentUrl = new URL(trimmed, targetUrl).toString();
            return `/api/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
          } catch {
            return line;
          }
        });

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(rewrittenLines.join("\n"));
      } else {
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (err: any) {
      console.error("Proxy error:", err);
      res.status(500).send(`Proxy error: ${err.message}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
