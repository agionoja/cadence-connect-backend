import { jwtSign } from "./jwt.js";
import crypto from "node:crypto";

export const apiBaseUrlVersion = (version) => {
  return `api/v${version}`;
};

export const generateEtag = (data) =>
  crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");

export const catchAsync = (cb) => (req, res, next) =>
  cb(req, res, next).catch(next);

export const filterResBody = (object, ...keys) =>
  Object.keys(object).reduce((filtered, key) => {
    if (keys.includes(key)) {
      filtered[key] = object[key];
    }
    return filtered;
  }, {});

export const objectValueToBool = (object) =>
  Object.keys(object).reduce((acc, key) => {
    if (object[key] === "true") {
      acc[key] = true;
    } else if (object[key] === "false") {
      acc[key] = false;
    } else {
      acc[key] = object[key];
    }

    return acc;
  }, {});

export const sendResToken = async (res, user, statusCode = 200) => {
  const token = await jwtSign(user._id);
  res.status(statusCode).json({
    token,
    statusText: "success",
    data: { user },
  });
};
