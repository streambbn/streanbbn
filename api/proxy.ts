import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Parse query parameter 'url'
  const urlObj = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const targetUrlParam = urlObj.searchParams.get("url") || (req.query && req.query.url);

  if (!targetUrlParam) {
    res.statusCode = 400;
    res.end("Missing 'url' query parameter");
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
      res.statusCode = response.status;
      res.end(`Upstream server returned status ${response.status}`);
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
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.statusCode = 200;
      res.end(rewrittenLines.join("\n"));
    } else {
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      const arrayBuffer = await response.arrayBuffer();
      res.statusCode = 200;
      res.end(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    console.error("Vercel proxy error:", err);
    res.statusCode = 500;
    res.end(`Proxy error: ${err.message}`);
  }
}
