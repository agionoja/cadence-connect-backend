// Lib imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

// Project imports
import AppError from "./utils/appError.js";
import globalError from "./middlewares/globalError.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import { apiBaseUrlV1 } from "./utils/apiBaseUrl.js";

const app = express();
app.use(cors());
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes handler
app.use(`${apiBaseUrlV1}/users`, userRoutes);
app.use(`${apiBaseUrlV1}/events`, eventRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} is not on this server`, 404));
});

app.use(globalError);

export default app;
