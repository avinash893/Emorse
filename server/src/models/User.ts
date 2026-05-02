import { PhoneNumber } from "@clerk/backend";
import mongoose from "mongoose";
import { time } from "node:console";
import { email, int } from "zod";

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: int,
      required: true,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false },
);

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  { timestamps: true },
);


export const User = mongoose.models.User || mongoose.model("User", userSchema);