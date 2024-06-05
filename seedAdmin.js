import inquirer from "inquirer";
import dotenv from "dotenv/config.js";
import connectToDB from "./src/utils/db.js";
import User from "./src/models/userModel.js";

// Function to prompt for admin details and save to the database
const seedAdmin = async () => {
  const answers = await inquirer.prompt([
    { name: "name", message: "Enter name:" },
    { name: "email", message: "Enter email:" },
    { type: "password", name: "password", message: "Enter password:" },
    { type: "password", name: "passwordConfirm", message: "Confirm password:" },
    {
      type: "list",
      name: "role",
      message: "Select role:",
      choices: ["admin", "superAdmin"],
      default: "admin",
    },
  ]);

  const admin = new User({
    name: answers.name,
    email: answers.email,
    password: answers.password,
    passwordConfirm: answers.passwordConfirm,
    role: answers.role,
  });

  await admin.save();
  console.log("Admin saved:", admin);
};

// Connect to the database and then prompt for admin details
const run = async () => {
  try {
    await connectToDB({ localDb: false });
    await seedAdmin();
  } catch (error) {
    console.error("Error connecting to the database or saving admin:", error);
  }
};

// Run the run function if this file is run directly
// if (import.meta.url === `file://${process.argv[1]}`) {
// }
(async () => await run())();
