import catchAsync from "../utils/catchAsync.js";
import sanitizeBody from "../utils/sanitizeBody.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import { jwtSign } from "../utils/jwt.js";

export const signUp = catchAsync(async (req, res, next) => {
  const body = sanitizeBody(
    req.body,
    "name",
    "email",
    "password",
    "passwordConfirm",
    "role", // FIXME: Remove this in prod.
  );
  const user = await User.create(body, { aggregateErrors: true });
  res.status(200).json({
    statusText: "success",
    data: {
      user,
    },
  });
});

export const signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password").exec();
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!user.comparePassword(password, this.password)) {
    return next(new AppError("Password or email is incorrect", 401));
  }

  const token = await jwtSign(user._id);
  user.password = undefined;
  res.status(200).json({
    token,
    statusText: "success",
    data: { user },
  });
});

export const signOut = catchAsync(async (req, res, next) => {});

export default {
  signUp,
  signIn,
  signOut,
};
