import { Request, Response, Router } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { User } from "../../models/User";
import { ok } from "../../envolope";

export const authRouter = Router();

authRouter.post("/sync", async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const extractEmail = clerkUser.emailAddresses[0]?.emailAddress || "";

    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const name = fullName || clerkUser.username || "Unknown User";
    const raw = process.env.ADMIN_EMAILS || "";
    const adminEmails = raw.split(",").map((email) => email.trim());
    const role = adminEmails.includes(extractEmail) ? "admin" : "user";

    const user = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { $set: { email: extractEmail, name, role } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    if (!user) {
      return res.status(500).json({ message: "Failed to sync user" });
    }

    return res.status(200).json(
      ok({
        user: {
          id: user._id,
          clerkUserId: user.clerkUserId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }),
    );
  } catch (error) {
    console.error("Error syncing user:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    return res.status(200).json(
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
    return res.status(500).json({ message: "Internal server error" });
  }
});
