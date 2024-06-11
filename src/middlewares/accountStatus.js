import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const checkAccountStatus = (user) => {
  if (user.isSuspended && user.suspensionDuration.getTime() > Date.now()) {
    throw new AppError(
      `Your account is suspended until ${user.suspensionDuration.toLocaleString()}. Please contact support.`,
      403,
    );
  }

  if (user.isTerminated) {
    throw new AppError(
      "Your account has been terminated. Please contact support.",
      403,
    );
  }
};

export const handleAccountStatus = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("User not found", 404));
  }
  checkAccountStatus(req.user);
  next();
});
