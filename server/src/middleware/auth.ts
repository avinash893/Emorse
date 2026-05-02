import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new AppError(401, "Unauthorized"));
  }
  next();
}

export async function getDbUserFromReq(req: Request) {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const dbUser = await User.findOne({ clerkUserId: userId });
  if (!dbUser) {
    throw new AppError(404, "User not found");
  }
  return dbUser;
}

//admin gate  loged in user must be admin to access the route

export const requireAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const dbUser = await getDbUserFromReq(req);
    if (dbUser.role !== "admin") {
      return next(
        new AppError(403, "Forbidden user must be admin to access this route"),
      );
    }
    next();
  },
);
