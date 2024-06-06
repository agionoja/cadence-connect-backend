import mongoose from "mongoose";
import chalk from "chalk";

const { DATABASE_LOCAL, DATABASE_PASSWORD, DATABASE_URL } = process.env;

export default async function connectToDB(options = { localDb: false }) {
  const isOnline =
    process.env.NODE_ENV === "production" ? true : !options.localDb;
  try {
    const onlineDb = DATABASE_URL.replace("<password>", DATABASE_PASSWORD);
    await mongoose.connect(isOnline ? onlineDb : DATABASE_LOCAL);

    console.log(
      chalk.blueBright(
        `${isOnline ? "Online" : "Local"} Database is connected successfully`,
      ),
    );
  } catch (err) {
    throw err;
  }
}
