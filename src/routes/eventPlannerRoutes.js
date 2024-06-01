import express from "express";
import eventPlannerController from "../controllers/eventPlannerController.js";

const router = express.Router();

router
  .route("/")
  .post(eventPlannerController.createEventPlanner)
  .get(eventPlannerController.getAllEventPlanners);

router
  .route("/:id")
  .get(eventPlannerController.getEventPlanner)
  .patch(eventPlannerController.updateEventPlanner)
  .delete(eventPlannerController.deleteEventPlanner);

export default router;
