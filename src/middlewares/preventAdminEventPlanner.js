import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import { ROLES } from "../utils/constants.js";

const preventAdminEventPlanner = async (req, res, next) => {
  const { user, targetUser } = req;

  if (
    user.email === targetUser.email &&
    (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN)
  ) {
    return next(
      new AppError(
        "Admins and super admins cannot apply to be event planners. Please use a regular account.",
        403,
      ),
    );
  }
  next();
};

export default preventAdminEventPlanner;
