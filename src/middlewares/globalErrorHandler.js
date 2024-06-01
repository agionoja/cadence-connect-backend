import cloneDeep from "clone-deep";

function sendProdError(err, res) {}
function sendDevError(err, res) {}

export default function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.status || 500;
  err.statusText = err.statusText || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else {
    let cloneErr = cloneDeep(err);
    sendProdError(cloneErr, res);
  }
}
