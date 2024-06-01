// Lib imports
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";

// Project imports
import AppError from "./utils/appError.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import eventPlannerRoutes from "./routes/eventPlannerRoutes.js";
import { apiBaseUrlV1 } from "./utils/apiBaseUrl.js";

const app = express();
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes handler
app.use(`${apiBaseUrlV1}/users`, userRoutes);
app.use(`${apiBaseUrlV1}/eventPlanners`, eventPlannerRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} is not on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
