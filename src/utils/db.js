import mongoose from "mongoose";
import chalk from "chalk";

const { DATABASE_LOCAL, DATABASE_PASSWORD, DATABASE_URL } = process.env;

export default async function connectToDB(options = { localDb: false }) {
  try {
    const databaseConnectionString = DATABASE_URL.replace(
      "<password>",
      DATABASE_PASSWORD,
    );
    await mongoose.connect(
      process.env.NODE_ENV === "production"
        ? databaseConnectionString
        : options.localDb
          ? DATABASE_LOCAL
          : databaseConnectionString,
    );

    console.log(
      chalk.blueBright(
        `${options.localDb ? "Local" : "Online"} Database is connected successfully`,
      ),
    );
  } catch (err) {
    throw err;
  }
}
