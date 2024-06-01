import mongoose from "mongoose";
import chalk from "chalk";
import * as crypto from "node:crypto";

const { DATABASE_LOCAL, DATABASE_PASSWORD, DATABASE_URL } = process.env;

export default async function connectToDB(options = { localDb: false }) {
  try {
    const databaseConnectionString = DATABASE_URL.replace(
      "<password>",
      DATABASE_PASSWORD,
    );
    await mongoose.connect(
      options.localDb ? DATABASE_LOCAL : databaseConnectionString,
    );

    console.log(chalk.blueBright(`Database is connected successfully`));
  } catch (err) {
    throw err;
  }
}
