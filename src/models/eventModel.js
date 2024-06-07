import mongoose from "mongoose";
import slugify from "slugify";
import pointSchema from "./pointSchema.js";

const categories = {
  values: [
    "conference",
    "trade shows",
    "seminars",
    "company parties",
    "product or service launch",
    "weddings",
    "festivals",
    "exhibitions",
    "charity",
    "sports and competition",
  ],
  message:
    "Invalid event subtype. Choose from: conference, trade shows, seminars, company parties, product or service launch, weddings, festivals, exhibitions, charity, sports and competition",
};

const eventSchema = new mongoose.Schema(
  {
    categories: {
      type: [String],
      required: [true, "At least one category is required"],
      enum: categories,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one category is required",
      },
    },
    coverImage: {
      type: String,
      required: [true, "An event must have a cover image"],
    },
    description: {
      type: String,
      minlength: [500, "Description cannot be less than 500 characters"],
      maxlength: [1000, "Description cannot be more 1000 characters"],
    },
    locations: [pointSchema],
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [4, "Name cannot be less than characters"],
      maxlength: [20, "Name cannot be more than characters"],
      unique: [true, "Name is taken"],
    },
    photos: [String],
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Ratings average cannot be less than zero"],
      max: [5, "Ratings average cannot be more than 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, "Ratings quantity cannot be less than zero"],
    },
    schedules: [Date],
    slug: String,
    startLocation: {
      type: pointSchema,
      required: [true, "Start location is required"],
    },
    summary: {
      type: String,
      minlength: [100, "Summary cannot be less than 100 letters"],
      maxlength: [150, "Summary cannot be less than 150 letters"],
    },
  },
  { timestamps: true },
);

eventSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
