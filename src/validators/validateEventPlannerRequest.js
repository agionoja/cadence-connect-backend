import AppError from "../utils/appError.js";

const validateEventPlannerRequest = (user, action, next) => {
  if (!user) {
    throw next(new AppError("User not found", 404));
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

    case "approve": {
      if (!user.applyForEventPlanner) {
        throw next(new AppError("User did not apply", 403));
      }

      if (user.eventPlannerApplicationStatus === "rejected") {
        throw next(new AppError("User has been rejected. Apply again", 403));
      }

      if (user.eventPlannerApplicationStatus === "approved") {
        throw next(new AppError("User is already an event planner", 409));
      }
      break;
    }

    case "reject": {
      if (!user.applyForEventPlanner) {
        throw next(new AppError("User did not apply", 403));
      }

      if (user.eventPlannerApplicationStatus === "approved") {
        throw next(new AppError("User is already an event planner", 409));
      }

      if (user.eventPlannerApplicationStatus === "rejected") {
        throw next(new AppError("User has already been rejected", 403));
      }
      break;
    }

    default:
      throw next(new AppError("Internal server error", 500));
  }
};

export default validateEventPlannerRequest;
