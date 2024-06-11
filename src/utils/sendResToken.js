import { jwtSign } from "./jwt.js";

const createSendToken = async (res, user, statusCode = 200) => {
  const token = await jwtSign(user._id);
  res.status(statusCode).json({
    token,
    statusText: "success",
    data: { user },
  });
};

export default createSendToken;
