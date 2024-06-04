import crypto from "node:crypto";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import filterObject from "../utils/filterObject.js";
import createSendToken from "../utils/createSendToken.js";
import User from "../models/userModel.js";

export const signUp = catchAsync(async (req, res, next) => {
  const body = filterObject(
    req.body,
    "name",
    "email",
    "password",
    "passwordConfirm",
    "role", // FIXME: Remove this in prod.
  );
  const user = await User.create(body);
  user.password = undefined; // password is selected to false on schema, but it does not work on creation
  await createSendToken(res, user, 200);
});

export const signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password").exec();

  if (!user || !user.comparePassword(password, user.password)) {
    return next(new AppError("Password or email is incorrect", 401));
  }

  user.password = undefined;
  await createSendToken(res, user, 200);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email cannot be empty", 404));
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(new AppError("Email does not exist", 401));
  }

  // TODO: Implement email service, to send the reset password url to the user
  const resetToken = await user.generatePasswordResetToken();
  // await user.save({ validateBeforeSave: false });
  const resetTokenUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

  res.status(200).json({
    statusText: "success",
    message: "The password rest token has been sent to your email",
    resetTokenUrl,
    resetToken,
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    return next(new AppError("Token is invalid or is expired", 401));
  }

  const { password, passwordConfirm } = req.body;
  if (!password === passwordConfirm) {
    return next(new AppError("Passwords do not match", 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();
  user.password = undefined;
  await createSendToken(res, user, 200);
});

export default {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
};
