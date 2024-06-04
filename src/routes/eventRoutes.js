import express from "express";
import eventController from "../controllers/eventController.js";

const router = express.Router();

router
  .route("/")
  .post(eventController.createEvent)
  .get(eventController.getAllEvents);

router
  .route("/:id")
  .get(eventController.getEvent)
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

export default router;
