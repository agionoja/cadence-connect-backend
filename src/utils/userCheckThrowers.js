import { APPLICATION_STATUS, ROLES as Role, ROLES } from "./constants.js";
import AppError from "./appError.js";

const isAdmin = (user) => user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

export const userStatus = (user) => {
  if (!user) {
    throw new AppError(
      "User information is required to check account status. Please provide a valid user object.",
      400,
    );
  }

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

export const applicationStatus = (user, action) => {
  if (user.role === ROLES.EVENT_PLANNER) {
    throw new AppError("User is already an event planner", 409);
  }

  if (user.eventPlannerApplicationStatus === APPLICATION_STATUS.APPROVED) {
    throw new AppError("User is already an event planner", 409);
  }

  switch (action) {
    case "apply":
      if (isAdmin(user)) {
        throw new AppError(
          "Admins and super admins cannot apply to be event planners. Please use a regular account.",
          403,
        );
      }

      if (user.eventPlannerApplicationStatus === APPLICATION_STATUS.PENDING) {
        throw new AppError("User application is pending", 409);
      }

      if (user.email !== req.user.email && !isAdmin(req.user)) {
        throw new AppError(
          "Only Admins and superAdmins can add other users as event planners",
          403,
        );
      }
      break;

    case "approve":
    case "reject":
      if (!user.applyForEventPlanner) {
        throw new AppError("User did not apply", 403);
      }
      if (user.eventPlannerApplicationStatus === APPLICATION_STATUS.REJECTED) {
        throw new AppError("User has already been rejected. Apply again", 403);
      }
      break;

    default:
      throw new AppError(
        "Invalid action for event planner application. Please specify 'apply', 'approve', or 'reject'.",
        400,
      );
  }
};

export const disciplineAction = (user, action) => {
  if (action.startsWith("suspend") && user.isSuspended) {
    throw new AppError("User is already suspended", 400);
  }

  if (action.startsWith("terminate") && user.isTerminated) {
    throw new AppError("User is already terminated", 400);
  }

  switch (action) {
    case "suspendUser": {
      if (isAdmin(user)) {
        throw new AppError("This route is for suspending only non admin users", 403);
      }
      break;
    }

    case "suspendAdmin": {
      if (user.role === "admin") {
        throw new AppError("This route is only for suspending admins", 403);
      }

      break;
    }

    case "unsuspendUser": {
      if (isAdmin(user)) {
        throw new AppError(
          "This route is for un suspending only non admin users",
          403,
        );
      }
      break;
    }
    case "unsuspendAdmin": {
      if (user.role !== ROLES.ADMIN) {
        throw new AppError("This route is for un suspending only admin", 403);
      }
      break;
    }

    case "terminateUser": {
      if (isAdmin(user)) {
        throw new AppError(
          "This route is for terminating only non admin users",
          403,
        );
      }
      break;
    }

    case "terminateAdmin": {
      if (user.role !== ROLES.ADMIN) {
        throw new AppError("This route is for terminating only admins", 403);
      }
      break;
    }

    default: {
      throw new AppError(
        "Invalid action for event planner application. Please specify 'apply', 'approve', or 'reject'.",
        400,
      );
    }
  }
};

export const deleteManyAction = async (query, User) => {
  if (Object.keys(query).length === 0) {
    throw new AppError(
      "Please provide a valid query with user criteria for deletion.",
      400,
    );
  }

  if (query.role === ROLES.SUPER_ADMIN) {
    throw new AppError("Cannot delete a superAdmin user through this route.", 400);
  }

  if (query.role) {
    query.role = { $eq: query.role, $ne: ROLES.SUPER_ADMIN };
  } else {
    query.role = { $ne: ROLES.SUPER_ADMIN };
  }

  const deletedUsers = await User.deleteMany(query).exec();

  if (!deletedUsers.deletedCount) {
    throw new AppError(
      "No users were deleted because no users matched the criteria.",
      404,
    );
  }

  return {
    deletedCount: deletedUsers.deletedCount,
    acknowledged: deletedUsers.acknowledged,
  };
};
