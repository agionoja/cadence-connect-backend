import express from "express";
import userController from "../controllers/userController.js";
import authController from "../controllers/authController.js";
import protect from "../middlewares/protect.js";
import restrictTo from "../middlewares/restrictTo.js";

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

router.patch(
  "/:id/event-planner/apply",
  protect,
  userController.applyForEventPlanner,
);
router.patch(
  "/:id/event-planner/approve",
  protect,
  restrictTo("admin", "superAdmin"),
  userController.approveEventPlanner,
);
router.patch(
  "/:id/event-planner/reject",
  protect,
  restrictTo("admin", "superAdmin"),
  userController.rejectEventPlanner,
);

router.route("/").post(userController.createUser).get(userController.getUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
