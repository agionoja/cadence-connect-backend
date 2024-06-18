import cron from "node-cron";
import axios from "axios";
import User from "../models/userModel.js";
import chalk from "chalk";

export const spinOnlineServer = () => {
  return cron.schedule("*/10 * * * *", async () => {
    try {
      const response = await axios.post(
        "https://cadence-connect-backend.onrender.com/api/v1/users/sign-in",
        {
          email: process.env.CRONE_EMAIL,
          password: process.env.CRONE_PASSWORD,
        },
      );

      console.log(
        `${response.data.data.user.name} is spinning the server at ${new Date().toUTCString()}`,
      );
    } catch (err) {
      console.log("Error signing in", err.message);
    }
  });
};

export const unsuspendUsers = () => {
  return cron.schedule("*/60 * * * *", async () => {
    const usersToUnsuspend = await User.find({
      isSuspended: true,
      suspensionDuration: { $exists: true },
    }).exec();

    if (usersToUnsuspend.length <= 0) {
      console.log(chalk.red("No users to unsuspend"));
      return;
    }

    const loop = usersToUnsuspend.length;
    for (let i = 0; i < loop; i++) {
      const user = usersToUnsuspend[i];

      if (Date.now() > user.suspensionDuration.getTime()) {
        await user.unsuspendUser();
        console.log(chalk.green(`${user.name} is unsuspended`));
      }
    }
  });
};

export const terminateFrequentSuspendedUsers = () => {
  return cron.schedule("*/60 * * * *", async () => {});
};
