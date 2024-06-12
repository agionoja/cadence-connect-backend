import mongoose from "mongoose";
import chalk from "chalk";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import AppError from "./appError.js";

const { DATABASE_LOCAL, DATABASE_PASSWORD, DATABASE_URL } = process.env;

export default async function connectToDB(options = { localDb: false }) {
  const isOnline =
    process.env.NODE_ENV === "production" ? true : !options.localDb;
  const maxRetries = 3;
  const onlineDb = DATABASE_URL.replace("<password>", DATABASE_PASSWORD);

  let retries = 0;
  let connected = false;

  while (maxRetries > retries && !connected) {
    try {
      await mongoose.connect(isOnline ? onlineDb : DATABASE_LOCAL);
      console.log(
        chalk.blueBright(
          `${isOnline ? "Online" : "Local"} Database is connected successfully`,
        ),
      );
      connected = true;
    } catch (err) {
      retries += 1;
      if (retries >= maxRetries && isOnline) {
        console.error(
          chalk.red(
            `Failed to connect to the online database after ${maxRetries} attempts. Switching to local database.`,
          ),
        );
        // Switch to local database
        try {
          await mongoose.connect(DATABASE_LOCAL);
          console.log(
            chalk.blueBright("Local Database is connected successfully"),
          );
          connected = true;
        } catch (localErr) {
          console.error(chalk.red("Failed to connect to the local database."));
          throw localErr;
        }
      } else {
        console.error(
          chalk.red(
            `Attempt ${retries} to connect to the online database failed.`,
          ),
        );
      }
    }
  }
}

export const findUserById = async (id, lean = false) => {
  const user = await User.findById(id, {}, { lean }).exec();
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const findEventById = async (id, lean = false) => {
  const event = await Event.findById(id, {}, { lean }).exec();
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  return event;
};
