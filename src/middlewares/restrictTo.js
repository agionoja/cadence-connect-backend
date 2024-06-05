import AppError from "../utils/appError.js";

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    return next(
      new AppError("You are not authorized to access this resource.", 401),
    );
  };

export default restrictTo;
