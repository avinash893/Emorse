import { Request, Response } from "express";
import { Router } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { User } from "../../models/User";
import { ok } from "../../envolope";
import { AppError } from "../../utils/AppError";

export const authRouter = Router();

authRouter.post("/sync", async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const extractEmail = clerkUser.emailAddresses[0]?.emailAddress;

    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const name = fullName || clerkUser.username || "Unknown User";
    const raw = process.env.ADMIN_EMAILS || "";
    const adminEmails = raw.split(",").map((email) => email.trim());
    const isAdmin = adminEmails.includes(extractEmail || "");

    const existingUser = await User.findOne({ clerkUserId: userId });

    if (!existingUser) {
      const newUser = new User({
        clerkUserId: userId,
        email: extractEmail,
        name,
        role: isAdmin ? "admin" : "user",
      });
      await newUser.save();
    } else {
      if (
        existingUser.email !== extractEmail ||
        existingUser.name !== name ||
        existingUser.role !== (isAdmin ? "admin" : "user")
      ) {
        existingUser.email = extractEmail;
        existingUser.name = name;
        existingUser.role = isAdmin ? "admin" : "user";
        await existingUser.save();
      }
    }

    const syncedUser = await User.findOne({ clerkUserId: userId });

    res.status(200).json(
      ok({
        user: {
          id: syncedUser?._id,
          clerkUserId: syncedUser?.clerkUserId,
          name: syncedUser?.name,
          email: syncedUser?.email,
          role: syncedUser?.role,
        },
      }),
    );
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await User.findOne({ clerkUserId: userId });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        },
      }),
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
