import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";
import * as userThrowers from "../utils/userCheckThrowers.js";
import { catchAsync, filterResBody, objectValueToBool } from "../utils/utils.js";
import { findUserById } from "../utils/db.js";
import User from "../models/userModel.js";
import { SUSPENSION_DURATION } from "../utils/constants.js";

export const createUser = catchAsync(async (req, res, next) => {
  const userData = filterResBody(
    req.body,
    "name",
    "email",
    "password",
    "passwordConfirm",
  );
  const user = await User.create(userData);

  res.status(200).json({
    statusText: "success",
    data: { user },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await findUserById(req.params.id, { lean: true });
  res.status(200).json({
    statusText: "success",
    data: {
      user,
    },
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const appQueries = new AppQueries(req.query, User.find({}, {}, { lean: true }))
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await appQueries.query.exec();

  res.status(200).json({
    statusText: "success",
    resultCount: users.length,
    data: { users },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  if (role && role !== "user" && role !== "eventPlanner") {
    return next(
      new AppError(
        "Invalid role. You can only assign roles 'user' or 'eventPlanner'.",
        400,
      ),
    );
  }

  const userData = filterResBody(req.body, "name", "email", "role");

  const updatedUser = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
    lean: true,
  });

  if (!updatedUser) {
    return next(new AppError("No user found with that ID.", 404));
  }

  res.status(200).json({
    statusText: "success",
    data: { updatedUser },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const { user } = req;

  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /users/update-Password",
        400,
      ),
    );
  }

  const userData = filterResBody(req.body, "email", "name");
  const updatedUser = await User.findByIdAndUpdate(user.id, userData, {
    runValidators: true,
    new: true,
    lean: true,
  });

  res.status(200).json({
    statusText: "success",
    data: { updatedUser },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id, {
    lean: true,
  }).exec();

  if (!deletedUser) {
    return next(new AppError("User not found", 404));
  }
  res.status(204).send();
});

export const deleteManyUsers = catchAsync(async (req, res, next) => {
  const query = objectValueToBool(req?.query);
  const { deletedCount, acknowledged } = await userThrowers.deleteManyAction(
    query,
    User,
  );

  if (acknowledged) {
    res.status(200).json({
      statusText: "success",
      deletedCount,
      acknowledged,
    });
  } else {
    return next(new AppError("Deletion operation not acknowledged", 500));
  }
});

export const disciplineUser = (action) =>
  catchAsync(async (req, res, next) => {
    const user = await findUserById(req.params.id);
    userThrowers.disciplineAction(user, action);

    if (action.startsWith("suspend")) {
      await user.suspendUser(SUSPENSION_DURATION.HOUR);
    } else if (action.startsWith("terminate")) {
      await user.terminateUser();
    } else if (action.startsWith("unsuspend")) {
      await user.unsuspendUser();
    }

    res.status(200).json({
      statusText: "success",
      data: { user },
    });
  });

export const eventPlannerApplication = (action) =>
  catchAsync(async (req, res, next) => {
    const user = await findUserById(req.params.id);
    userThrowers.applicationStatus(user, action);

    switch (action) {
      case "apply": {
        user.applyForEventPlanner = true;
        user.eventPlannerApplicationStatus = "pending";
        break;
      }

      case "approve": {
        user.eventPlannerApplicationStatus = "approved";
        user.role = "eventPlanner";
        break;
      }

      case "reject": {
        user.eventPlannerApplicationStatus = "rejected";
        break;
      }

      default: {
        return next(
          new AppError(
            "Invalid action for event planner application. Please specify 'apply', 'approve', or 'reject'.",
            400,
          ),
        );
      }
    }

    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      statusText: "success",
      data: { user },
    });
  });
