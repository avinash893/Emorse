import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import morgan from "morgan";
import { ok } from "./envolope";
import { notFound } from "./middleware/notFound";
import { error } from "node:console";
import { errorHandler } from "./middleware/errorHandler";
import { clerkMiddleware } from "@clerk/express";
import { authRouter } from "./routes/auth/auth.routes";

async function mainEntryFunction() {
  await connectDB();
  const app = express();
  const corsOrigins = process.env.CORS_ORIGINS?.split(",") || [];
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(clerkMiddleware());

  app.get("/api/health", (req, res) => {
    res.status(200).json(ok({ status: "ok" }));
  });

  app.use("api/auth", authRouter);

  app.use(notFound);
  app.use(errorHandler);

  const PORT = Number(process.env.PORT || 3000);

  app.listen(PORT, () => console.log("server is now listening on port", PORT));
}

mainEntryFunction().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
