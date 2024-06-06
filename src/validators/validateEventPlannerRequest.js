import AppError from "../utils/appError.js";

const validateEventPlannerRequest = (req, user, next, action) => {
  if (!user) {
    throw next(new AppError("User not found", 404));
  }

  if (
    req?.user.email === user.email &&
    (req?.user.role === "superAdmin" || req?.user.role === "admin")
  ) {
    throw next(
      new AppError(
        "Admins and super admins cannot be event planners. Please use a regular account.",
        403,
      ),
    );
  }

  switch (action) {
    case "apply": {
      if (user.eventPlannerApplicationStatus === "pending") {
        throw next(new AppError("User application is pending", 409));
      }

      if (user.eventPlannerApplicationStatus === "approved") {
        throw next(new AppError("User is already an event planner", 409));
      }
      break;
    }

    case "approve":
    case "reject": {
      if (!user.applyForEventPlanner) {
        throw next(new AppError("User did not apply", 403));
      }

      if (user.eventPlannerApplicationStatus === "approved") {
        throw next(new AppError("User is already an event planner", 409));
      }

      if (user.eventPlannerApplicationStatus === "rejected") {
        throw next(
          new AppError("User has already been rejected. Apply again", 403),
        );
      }
      break;
    }

    default:
      throw next(new AppError("Internal server error", 500));
  }
};

export default validateEventPlannerRequest;
