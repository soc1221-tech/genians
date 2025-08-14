import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { log } from "./vite.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Server Error:", err);
      console.error("Error Stack:", err.stack);

      res.status(status).json({ 
        message,
        error: process.env.NODE_ENV === "development" ? err.stack : undefined,
        timestamp: new Date().toISOString()
      });
    });

    // Serve static files from the built client
    const clientDistPath = path.join(__dirname, "../client/dist");
    
    // Check if client dist exists
    try {
      if (fs.existsSync(clientDistPath)) {
        app.use(express.static(clientDistPath));
        log(`Serving static files from: ${clientDistPath}`);
      } else {
        log(`Client dist directory not found: ${clientDistPath}`);
      }
    } catch (error) {
      log(`Error setting up static files: ${error}`);
    }

    // Serve the React app for all non-API routes
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        try {
          const indexPath = path.join(clientDistPath, "index.html");
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.json({ message: "Frontend not built yet", path: req.path });
          }
        } catch (error: any) {
          res.json({ message: "Error serving frontend", error: error.message });
        }
      }
    });

    // For Vercel, we don't need to listen on a port
    // The server will be handled by Vercel's serverless functions
    if (process.env.NODE_ENV !== "production") {
      const port = parseInt(process.env.PORT || '3001', 10);
      server.listen({
        port,
        host: "0.0.0.0",
      }, () => {
        log(`Development server running on port ${port}`);
      });
    } else {
      log("Production server ready for Vercel");
      // In production (Vercel), we don't start the server
      // Vercel handles the serverless function execution
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

// Export for Vercel serverless functions
export default app;
