import crypto from "node:crypto";
import { promisify } from "node:util";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import pointSchema from "./pointSchema.js";
import { APPLICATION_STATUS, ROLES } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [4, "Name is should be at least 4 characters long"],
      maxlength: [20, "Name should be less than 20 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Invalid email address",
      },
    },
    role: {
      type: String,
      enum: {
        values: [
          ROLES.REGULAR_USER,
          ROLES.EVENT_PLANNER,
          ROLES.ADMIN,
          ROLES.SUPER_ADMIN,
        ],
        message:
          "Invalid role. Choose one from: user, eventPlanner, admin or superAdmin",
      },
      default: "user",
    },
    location: pointSchema,
    profileImage: String,
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      select: false,
      validate: {
        validator: (value) =>
          /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,50}$/.test(value),
        message: ({ value }) => {
          if (value.length < 8) {
            return "Password must be at least 8 characters";
          }
          if (value.length > 50) {
            return "Password must be at most 50 characters";
          }
          if (!/[A-Z]/.test(value)) {
            return "Password must contain at least one uppercase letter";
          }
          if (!/[!@#$%^&*]/.test(value)) {
            return "Password must contain at least one special character";
          }
          return "Invalid password";
        },
      },
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password confirmation is required"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords do not match",
      },
      select: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isTerminated: {
      type: Boolean,
      default: false,
    },
    applyForEventPlanner: Boolean,
    eventPlannerApplicationStatus: {
      type: String,
      enum: {
        values: [
          APPLICATION_STATUS.APPROVED,
          APPLICATION_STATUS.PENDING,
          APPLICATION_STATUS.REJECTED,
        ],
        message: `invalid input({VALUE}). Choose from : pending, approved, rejected`,
      },
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    passwordResetTimer: Date,
    suspensionDuration: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedAt = Date.now() - 3000; // Handle save disparity (adjusting timestamp for consistency)
    this.passwordResetTimer = Date.now() + 1000 * 60 * 60 * 60 * 24; // TODO: implement password timer feature
  }
  next();
});

userSchema.methods.comparePassword = async function (
  plainPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

userSchema.methods.passwordChangedAfterJwt = function (iat) {
  if (this.passwordChangedAt) {
    const passwordChangedAtIat = this.passwordChangedAt.getTime() / 1000;
    return passwordChangedAtIat > iat;
  }
  return false;
};

userSchema.methods.generateAndSavePasswordResetToken = async function () {
  const token = (await promisify(crypto.randomBytes)(32)).toString("hex");
  this.passwordResetTokenExpires = Date.now() + 1000 * 60 * 60;
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.save({ validateBeforeSave: false });
  return token;
};

const User = mongoose.model("User", userSchema);

export default User;
