// Lib imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

// Project imports
import AppError from "./utils/appError.js";
import globalError from "./controllers/errorController.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import { spinOnlineServer, unsuspendUsers } from "./utils/croneJobs.js";

// Crone Jobs
spinOnlineServer();
unsuspendUsers();

const app = express();

app.use(cors());
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes handler
app.use(`/api/v1/users`, userRoutes);
app.use(`/api/v1/events`, eventRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} is not on this server`, 404));
});

app.use(globalError);

export default app;
