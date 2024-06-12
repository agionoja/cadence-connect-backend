import express from "express";
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js";
import * as cacheMiddleware from "../middlewares/cacheMiddleware.js";
import * as userMiddleware from "../middlewares/userMiddleware.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();
const { SUPER_ADMIN, ADMIN } = ROLES;

////////////////////////////////////////////////////////////////////////////////
/*METHODS PASSED TO THE RES OBJECT WILL BE USED ON DEMANDED*/
////////////////////////////////////////////////////////////////////////////////
router.use(userMiddleware.methods);

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

////////////////////////////////////////////////////////////////////////////////
/*PROTECTED ROUTES*/
////////////////////////////////////////////////////////////////////////////////
router.use(authController.protect);

router.patch("/update-password/:id", authController.updateMyPassword);
router.patch(
  "/:id/event-planner/apply",
  userController.eventPlannerApplication("apply"),
);

////////////////////////////////////////////////////////////////////////////////
/*RESTRICTED ROUTES*/
////////////////////////////////////////////////////////////////////////////////

// router.use(authController.restrictTo(SUPER_ADMIN, ADMIN));

router
  .route("/")
  .post(userController.createUser)
  .get(cacheMiddleware.cacheControl, userController.getAllUsers)
  .delete(
    authController.restrictTo(SUPER_ADMIN),
    userController.deleteManyUsers,
  );

router
  .route("/:id")
  .get(cacheMiddleware.cacheControl, userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.patch(
  "/:id/event-planner/approve",
  userController.eventPlannerApplication("approve"),
);
router.patch(
  "/:id/event-planner/reject",
  userController.eventPlannerApplication("reject"),
);

////////////////////////////////////////////////////////////////////////////////
/*DISCIPLINE USERS*/
////////////////////////////////////////////////////////////////////////////////
router.patch("/suspend/:id", userController.disciplineUser("suspendUser"));
router.patch("/unsuspend/:id", userController.disciplineUser("unsuspendUser"));
router.patch("/terminate/:id", userController.disciplineUser("terminateUser"));

router.patch(
  "/admin/suspend/:id",
  userController.disciplineUser("suspendAdmin"),
);
router.patch(
  "/admin/unsuspend/:id",
  userController.disciplineUser("unsuspendAdmin"),
);
router.patch(
  "/admin/terminate/:id",
  userController.disciplineUser("terminateAdmin"),
);

export default router;
