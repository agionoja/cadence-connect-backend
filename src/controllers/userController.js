import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";
import catchAsync from "../utils/catchAsync.js";
import filterObject from "../utils/filterObject.js";
import User from "../models/userModel.js";
import validateEventPlannerRequest from "../validators/validateEventPlannerRequest.js";

export const createUser = catchAsync(async (req, res, next) => {
  const body = filterObject(
    req.body,
    "name",
    "email",
    "password",
    "passwordConfirm",
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

export const getAllUsers = catchAsync(async (req, res, next) => {
  const appQueries = new AppQueries(req.query, User.find())
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await appQueries.query;

  res.status(200).json({
    statusText: "success",
    numResult: users.length,
    data: { users },
  });
});

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

export const applyForEventPlanner = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();
  validateEventPlannerRequest(req, user, next, "apply");
  user.applyForEventPlanner = true;
  user.eventPlannerApplicationStatus = "pending";
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const approveEventPlanner = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();
  validateEventPlannerRequest(req, user, next, "approve");
  user.eventPlannerApplicationStatus = "approved";
  user.role = "eventPlanner";
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const rejectEventPlanner = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();
  validateEventPlannerRequest(req, user, next, "reject");
  user.eventPlannerApplicationStatus = "rejected";
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    statusText: "success",
    data: { user },
  });
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
  approveEventPlanner,
  applyForEventPlanner,
  rejectEventPlanner,
};
