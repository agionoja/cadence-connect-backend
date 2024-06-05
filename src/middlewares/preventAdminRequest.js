import AppError from "../utils/appError.js";

const preventAdminRequest = (req, res, next) => {
  const user = req?.user;

  if (user.role === "admin" || user.role === "superAdmin") {
    return next(
      new AppError(
        "Admins and super admins cannot apply to be event planners. Please use a regular account.",
        403,
      ),
    );
  }
  next();
};

export default preventAdminRequest;
