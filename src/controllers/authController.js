import crypto from "node:crypto";
import AppError from "../utils/appError.js";
import { catchAsync, filterResBody, sendResToken } from "../utils/utils.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/email.js";
import { jwtDecode } from "../utils/jwt.js";
import { findUserById } from "../utils/db.js";
import { userStatus } from "../utils/userCheckThrowers.js";

export const signUp = catchAsync(async (req, res, next) => {
  const body = filterResBody(
    req.body,
    "name",
    "email",
    "password",
    "passwordConfirm",
  );
  const user = await User.create(body);
  user.password = undefined;
  await sendResToken(res, user, 201);
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

  userStatus(user);
  user.password = undefined;
  await sendResToken(res, user, 200);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email cannot be empty", 400));
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(new AppError("User does not exist", 404));
  }

  userStatus(user);
  const resetToken = await user.generateAndSavePasswordResetToken();
  const resetTokenUrl = `${req.protocol}://${req.get("host")}/api/v1/reset-password/${resetToken}`;
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

  userStatus(user);
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
  await sendResToken(res, user, 200);
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { oldPassword, password, passwordConfirm } = req.body;

  if (!oldPassword || !password || !passwordConfirm) {
    return next(
      new AppError(
        "Please provide all required fields: oldPassword, password, and passwordConfirm",
        400,
      ),
    );
  }

  if (!(await user.comparePassword(oldPassword, user.password))) {
    return next(new AppError("Your current password is incorrect", 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  user.password = undefined;
  user.passwordConfirm = undefined;

  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError("User not found"), 404);
    }
    if (roles.includes(req.user.role)) return next();
    return next(
      new AppError("You are not authorized to access this resource.", 401),
    );
  };

export const protect = catchAsync(async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401),
    );
  }

  const decoded = await jwtDecode(token);
  const user = await findUserById(
    decoded.id,
    {
      errMsg: "The user belonging to this account no longer exists.",
    },
    (query) => query.select("+password +passwordChangedAt"),
  );
  userStatus(user);

  if (user.passwordChangedAfterJwt(decoded.iat)) {
    return next(
      new AppError("Password recently changed. Please log in again.", 401),
    );
  }

  req.user = user;
  next();
});
