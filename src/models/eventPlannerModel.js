import mongoose from "mongoose";
import slugify from "slugify";

const eventPlannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [4, "Name is should be at least 4 characters long"],
      maxlength: [20, "Name should be less than 20 characters long"],
      unique: [true, "Name is taken"],
    },
    slug: String,
  },
  { timestamps: true },
);

eventPlannerSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    this.slug = slugify(this.slug, { lower: true });
  }
  next();
});

const EventPlanner = mongoose.model("EventPlanner", eventPlannerSchema);

export default EventPlanner;
