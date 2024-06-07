import express from "express";
import restrictTo from "../middlewares/restrictTo.js";
import userController from "../controllers/userController.js";
import authController from "../controllers/authController.js";
import protect from "../middlewares/protect.js";
import preventAdminEventPlanner from "../middlewares/preventAdminEventPlanner.js";
import findAndAttachUserToRequestFromParam from "../middlewares/findAndAttachUserToRequestFromParam.js";
import validateApplicationStatus from "../middlewares/validateApplicationStatus.js";

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

router.patch(
  "/:id/event-planner/apply",
  protect,
  findAndAttachUserToRequestFromParam("id", "targetUser"),
  preventAdminEventPlanner,
  validateApplicationStatus("apply"),
  userController.applyForEventPlanner,
);
router.patch(
  "/:id/event-planner/approve",
  protect,
  findAndAttachUserToRequestFromParam("id", "targetUser"),
  preventAdminEventPlanner,
  restrictTo("admin", "superAdmin"),
  validateApplicationStatus("approve"),
  userController.approveEventPlanner,
);
router.patch(
  "/:id/event-planner/reject",
  protect,
  findAndAttachUserToRequestFromParam("id", "targetUser"),
  preventAdminEventPlanner,
  restrictTo("admin", "superAdmin"),
  validateApplicationStatus("reject"),
  userController.rejectEventPlanner,
);

router
  .route("/")
  .post(userController.createUser)
  .get(protect, userController.getAllUsers);
router
  .route("/:id")
  .get(protect, userController.getUser)
  .patch(protect, userController.updateUser)
  .delete(protect, userController.deleteUser);

export default router;
