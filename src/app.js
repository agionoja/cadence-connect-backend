// Lib imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import axios from "axios";
import bodyParser from "body-parser";
import moment from "moment-timezone";
import cron from "node-cron";

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

cron.schedule("*/10 * * * *", async () => {
  try {
    const response = await axios.post(
      "https://cadence-connect-backend.onrender.com/api/v1/users/sign-in",
      {
        email: process.env.CRONE_EMAIL,
        password: process.env.CRONE_PASSWORD,
      },
    );

    const currentTimeInWAT = moment()
      .tz("Africa/Lagos")
      .format("YYYY-MM-DD HH:mm:ss");
    console.log(
      response.data.data.user.name +
        " is signed in at " +
        currentTimeInWAT +
        " WAT.",
    );
    // console.log("Running a task every 15 minutes");
  } catch (err) {
    console.log("Error signing in", err.message);
  }
});

// Routes handler
app.use(`/api/v1/users`, userRoutes);
app.use(`/api/v1/events`, eventRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} is not on this server`, 404));
});

app.use(globalError);

export default app;
