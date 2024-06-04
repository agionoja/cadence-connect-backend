import cloneDeep from "clone-deep";
import AppError from "../utils/appError.js";

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      statusText: err.statusText,
      message: err.message,
    });
  } else {
    res.status(500).json({
      statusText: "Internal Server Error",
      message: "Something went very wrong💥💥",
    });
  }
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    statusText: err.statusText,
    error: err,
    name: err.name,
    message: err.message,
    stack: err.stack,
    isOperational: err.isOperational,
  });
};

const handleDbValidationError = (err) => {
  const message = Object.keys(err.errors)
    .map((key) => err.errors[key].message)
    .join(". ");
  return new AppError(message, 400);
};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.statusText = err.statusText || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else {
    let cloneErr = cloneDeep(err);

    if (cloneErr.name === "ValidationError") {
      cloneErr = handleDbValidationError(cloneErr);
    }
    console.log(cloneErr.name);

    sendProdError(cloneErr, res);
  }
};

export default globalError;
