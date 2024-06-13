import crypto from "node:crypto";
import { promisify } from "node:util";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import pointSchema from "./pointSchema.js";
import {
  APPLICATION_STATUS,
  ROLES,
  SUSPENSION_DURATION,
} from "../utils/constants.js";

const { ADMIN, SUPER_ADMIN, REGULAR_USER, EVENT_PLANNER } = ROLES;
const { HOUR, DAY, BI_WEEK, WEEK, MONTH } = SUSPENSION_DURATION;

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
        values: [REGULAR_USER, EVENT_PLANNER, ADMIN, SUPER_ADMIN],
        message: `Invalid role. Choose one from: ${REGULAR_USER}, ${EVENT_PLANNER}, ${ADMIN}, ${SUPER_ADMIN}`,
      },
      default: "user",
    },
    location: {
      type: pointSchema,
      index: "2dsphere",
    },
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
    eventPlannerApplicationStatus: {
      type: String,
      enum: {
        values: [
          APPLICATION_STATUS.APPROVED,
          APPLICATION_STATUS.PENDING,
          APPLICATION_STATUS.REJECTED,
        ],
        message: `invalid input({VALUE}). Choose from : ${APPLICATION_STATUS.PENDING}, ${APPLICATION_STATUS.APPROVED} ,${APPLICATION_STATUS.REJECTED}`,
      },
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetTimer: {
      type: Date,
      select: false,
    },
    suspensionDuration: {
      type: Date,
      enum: {
        values: [HOUR, DAY, WEEK, BI_WEEK, MONTH],
        //tODO: PROVIDE A BETTER ERROR MESSAGE
      },
    },
    isSuspended: Boolean,
    isTerminated: Boolean,
    applyForEventPlanner: Boolean,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    suspensions: [Date],
    timezone: String,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 3000; // Handle save disparity (adjusting timestamp for consistency)
      this.passwordResetTimer = Date.now() + 1000 * 60 * 60 * 60 * 24; // TODO: implement password timer feature
    }
  }
  next();
});

userSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeTerminated) {
    this.find({ isTerminated: { $ne: true } });
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

userSchema.methods.suspendUser = async function (
  duration = 60 * 60 * 60 * 24 * 14,
) {
  this.isSuspended = true;
  this.suspensionDuration = Date.now() + duration * 1000;
  this.suspensions = [...this.suspensions, Date.now()]; //TODO: suspensions is not appended
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.unsuspendUser = async function () {
  this.isSuspended = undefined;
  this.suspensionDuration = undefined;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.terminateUser = async function () {
  this.isTerminated = true;
  await this.save({ validateBeforeSave: false });
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
