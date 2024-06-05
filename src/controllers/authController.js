import crypto from "node:crypto";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import filterObject from "../utils/filterObject.js";
import createSendToken from "../utils/createSendToken.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/email.js";
import { apiBaseUrlV1 } from "../utils/apiBaseUrl.js";

export const signUp = catchAsync(async (req, res, next) => {
  const body = filterObject(
    req.body,
    "name",
    "email",
    "password",
    "passwordConfirm",
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
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Password or email is incorrect", 401));
  }

  user.password = undefined;
  await createSendToken(res, user, 200);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email cannot be empty", 400));
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(new AppError("Email does not exist", 404));
  }

  const resetToken = await user.generateAndSavePasswordResetToken();
  const resetTokenUrl = `${req.protocol}://${req.get("host")}/${apiBaseUrlV1}/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetTokenUrl}`;

  try {
    await sendEmail({
      to: email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      statusText: "success",
      message: "The password reset token has been sent to your email",
      resetTokenUrl,
      resetToken,
    });
  } catch (err) {
    user.passwordResetTokenExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(err.message, 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  })
    .select("+password")
    .exec();

  if (!user) {
    return next(new AppError("Token is invalid or is expired", 401));
  }

  const { password, passwordConfirm } = req.body;
  if (await user.comparePassword(password, user.password)) {
    return next(
      new AppError("New password cannot be the same as the old password", 401),
    );
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
