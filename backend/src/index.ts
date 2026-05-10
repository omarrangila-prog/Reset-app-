import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

import coachRouter from "./routes/coach";
import streakRouter from "./routes/streak";
import logRouter from "./routes/log";
import userRouter from "./routes/user";

const app = express();
const PORT = process.env.PORT || 4000;

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Logging
app.use(morgan("dev"));

// Body parsing
app.use(express.json({ limit: "10kb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Breathe. Try again in 15 minutes." },
});

const coachLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Slow down. Take a breath between requests." },
});

app.use("/api", limiter);
app.use("/api/coach", coachLimiter);

// Routes
app.use("/api/coach", coachRouter);
app.use("/api/streak", streakRouter);
app.use("/api/log", logRouter);
app.use("/api/user", userRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "RESET API", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong" });
  }
);

app.listen(PORT, () => {
  console.log(`
  ██████╗ ███████╗███████╗███████╗████████╗
  ██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝
  ██████╔╝█████╗  ███████╗█████╗     ██║   
  ██╔══██╗██╔══╝  ╚════██║██╔══╝     ██║   
  ██║  ██║███████╗███████║███████╗   ██║   
  ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   
  
  API running on http://localhost:${PORT}
  `);
});

export default app;
