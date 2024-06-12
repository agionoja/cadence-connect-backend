import express from "express";
import * as cacheMiddleware from "../middlewares/cacheMiddleware.js";
import * as authController from "../controllers/authController.js";
import eventController from "../controllers/eventController.js";

const router = express.Router();
////////////////////////////////////////////////////////////////////////////////
/*PROTECTED ROUTES*/
////////////////////////////////////////////////////////////////////////////////
router.use(authController.protect);

router
  .route("/")
  .post(eventController.createEvent)
  .get(cacheMiddleware.cacheControl, eventController.getAllEvents);

router
  .route("/:id")
  .get(cacheMiddleware.cacheControl, eventController.getEvent)
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

export default router;
