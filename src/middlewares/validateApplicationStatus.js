import AppError from "../utils/appError.js";
import { APPLICATION_STATUS, ROLES } from "../utils/constants.js";

const validateApplicationStatus = (action) => (req, res, next) => {
  const user = req?.targetUser;

  if (user.role === ROLES.EVENT_PLANNER) {
    return next(new AppError("User is already an event planner", 409));
  }

  if (user.eventPlannerApplicationStatus === APPLICATION_STATUS.APPROVED) {
    return next(new AppError("User is already an event planner", 409));
  }

  switch (action) {
    case "apply":
      if (user.eventPlannerApplicationStatus === APPLICATION_STATUS.PENDING) {
        return next(new AppError("User application is pending", 409));
      }
      break;

    case "approve":
    case "reject":
      if (!user.applyForEventPlanner) {
        return next(new AppError("User did not apply", 403));
      }
      if (user.eventPlannerApplicationStatus === APPLICATION_STATUS.REJECTED) {
        return next(
          new AppError("User has already been rejected. Apply again", 403),
        );
      }
      break;

    default:
      return next(new AppError("Internal server error", 500));
  }

  next();
};

export default validateApplicationStatus;
