import User from "./src/models/userModel.js";

const seedAmin = async () => {
  await User.create({
    name: "Divine Paul",
    email: "divine.paul@gmail.com",
    password: "Ch)ngf!lAwas",
    passwordConfirm: "Ch)ngf!lAwas",
    role: "admin",
  });
};

(async () => await seedAmin())();
