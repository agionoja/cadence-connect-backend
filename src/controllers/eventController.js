import { catchAsync, filterResBody } from "../utils/utils.js";
import Event from "../models/eventModel.js";
import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";

export const createEvent = catchAsync(async (req, res, next) => {
  const body = filterResBody(
    req.body,
    "name",
    "categories",
    "description",
    "location",
    "ratingsAverage",
    "ratingsQuantity",
    "startLocation",
    "locations",
    "schedules",
    "coverImage",
  );

  const event = await Event.create(body);

  res.status(200).json({
    statusText: "success",
    data: {
      event,
    },
  });
});

export const getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id, {}, { lean: true });
  if (!event) {
    return next(new AppError("Event not found", 404));
  }
  res.status(200).json({
    statusText: "success",
    data: {
      event,
    },
  });
});

export const getAllEvents = catchAsync(async (req, res, next) => {
  const appQueries = new AppQueries(req.query, Event.find())
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const events = await appQueries.query;

  res.status(200).json({
    statusText: "success",
    numResult: events.length,
    data: {
      events,
    },
  });
});

export const updateEvent = catchAsync(async (req, res, next) => {
  const body = filterResBody(
    req.body,
    "name",
    "categories",
    "description",
    "location",
    "ratingsAverage",
    "ratingsQuantity",
    "startLocation",
    "locations",
    "schedules",
    "coverImage",
  );
  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, body, {
    lean: true,
  });

  if (!updatedEvent) {
    return next(new AppError("Event not found", 404));
  }

  res.status(200).json({
    statusText: "success",
    data: { updatedEvent },
  });
});

export const deleteEvent = catchAsync(async (req, res, next) => {
  const deletedEvent = await Event.findByIdAndDelete(req.params.id, {
    lean: true,
  });

  if (!deletedEvent) {
    return next(new AppError("Event not found", 404));
  }
  res.status(204).end();
});

export default {
  createEvent,
  getEvent,
  deleteEvent,
  getAllEvents,
  updateEvent,
};
