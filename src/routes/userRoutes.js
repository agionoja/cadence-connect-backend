import express from "express";
import userController from "../controllers/userController.js";
import authController from "../controllers/authController.js";

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.post("/sign-out", authController.signOut);
router.route("/").post(userController.createUser).get(userController.getUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
export default router;
