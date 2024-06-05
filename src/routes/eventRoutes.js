import express from "express";
import eventController from "../controllers/eventController.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

router
  .route("/")
  .post(protect, eventController.createEvent)
  .get(protect, eventController.getAllEvents);

router
  .route("/:id")
  .get(protect, eventController.getEvent)
  .patch(protect, eventController.updateEvent)
  .delete(protect, eventController.deleteEvent);

export default router;
