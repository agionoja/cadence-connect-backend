import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";
import catchAsync from "../utils/catchAsync.js";
import filterResBody from "../utils/filterResBody.js";
import User from "../models/userModel.js";
import { findUserById } from "../utils/db.js";
import { SUSPENSION_DURATION } from "../utils/constants.js";
import objectValueToBool from "../utils/objectValueToBool.js";

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
  const user = await findUserById(req.params.id, true);
  res.status(200).json({
    statusText: "success",
    data: {
      user,
    },
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const appQueries = new AppQueries(
    req.query,
    User.find({}, {}, { lean: true }),
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await appQueries.query.exec();

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

export const deleteManyUsers = catchAsync(async (req, res, next) => {
  const query = objectValueToBool(req?.query);
  const { deletedCount, acknowledged } = await res.deleteManyUserCheck(
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
    res.checkUserStatus(req.user);
    res.disciplineUserCheck(user, action);

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
    res.checkUserStatus(user);
    res.validateApplicationStatus(user, action);

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
