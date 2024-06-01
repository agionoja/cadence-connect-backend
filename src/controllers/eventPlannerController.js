import catchAsync from "../utils/catchAsync.js";
import EventPlanner from "../models/eventPlannerModel.js";
import sanitizeBody from "../utils/sanitizeBody.js";

export const createEventPlanner = catchAsync(async (req, res, next) => {
  const body = sanitizeBody(req.body, "name");

  const eventPlanner = await EventPlanner.create(body, {
    aggregateErrors: true,
  });

  res.status(200).json({
    statusText: "success",
    data: {
      eventPlanner,
    },
  });
});

export const getEventPlanner = catchAsync(async (req, res, next) => {});
export const getAllEventPlanners = catchAsync(async (req, res, next) => {});
export const updateEventPlanner = catchAsync(async (req, res, next) => {});
export const deleteEventPlanner = catchAsync(async (req, res, next) => {});

export default {
  createEventPlanner,
  getEventPlanner,
  deleteEventPlanner,
  getAllEventPlanners,
  updateEventPlanner,
};
