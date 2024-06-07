import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";

const findAndAttachUserToRequestFromParam = (param, userId) =>
  catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params[param]).exec();
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    req[userId] = user;
    next();
  });

export default findAndAttachUserToRequestFromParam;
