// Lib imports
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Project imports
import AppError from "./utils/appError.js";
import globalError from "./middlewares/globalError.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import { apiBaseUrlV1 } from "./utils/apiBaseUrl.js";

const app = express();
dotenv.config({ path: "./.env" });

app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes handler
app.use(`/cadence-connect/api/v1/users`, userRoutes);
app.use(`/cadence-connect/api/v1/events`, eventRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} is not on this server`, 404));
});

app.use(globalError);

export default app;
