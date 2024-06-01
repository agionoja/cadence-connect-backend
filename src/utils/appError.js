export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusText = `${statusCode}`.startsWith("4")
      ? "fail"
      : "Internal Server Error";
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
    s;
  }
}
