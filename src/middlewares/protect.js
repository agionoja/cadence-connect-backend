import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { jwtDecode } from "../utils/jwt.js";
import User from "../models/userModel.js";

const protect = catchAsync(async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in", 403));
  }

  const decoded = await jwtDecode(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User no longer exists", 403));
  }

  //   TODO: implement suspend and ban feature

  if (user.passwordChangedAfterJwt(decoded.iat)) {
    return next(new AppError("User recently changed password", 403));
  }

  req.user = user; // FIXME: remove the password from the user object
  next();
});

export default protect;
