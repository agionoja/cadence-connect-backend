import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import filterObject from "../utils/filterObject.js";
import User from "../models/userModel.js";

export const createUser = catchAsync(async (req, res, next) => {
  const body = filterObject(
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

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params, {}, { lean: true }).exec();
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    statusText: "success",
    data: {
      user,
    },
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {});
export const updateUser = catchAsync(async (req, res, next) => {});

export const deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id, {
    lean: true,
  }).exec();
  if (!deletedUser) {
    return next(new AppError("User not found", 404));
  }
  res.status(204).send();
});

export const suspendUser = catchAsync(async (req, res, next) => {});
export const terminateUser = catchAsync(async (req, res, next) => {});

export default {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  suspendUser,
  terminateUser,
};
