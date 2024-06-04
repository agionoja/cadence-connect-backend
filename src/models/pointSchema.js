import mongoose from "mongoose";

const validateGeoJsonCoordinates = (value) => {
  if (!Array.isArray(value) || value.length !== 2) {
    return "Coordinates must be an array of two numbers";
  }
  const [longitude, latitude] = value;
  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return "Both coordinates must be numbers";
  }
  if (longitude < -180 || longitude > 180) {
    return "Longitude must be between -180 and 180";
  }
  if (latitude < -90 || latitude > 90) {
    return "Latitude must be between -90 and 90";
  }
  return true;
};

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "A location must have a type of Point"],
    enum: {
      values: ["Point"],
      message: "A location must have a type of Point",
    },
  },
  coordinates: {
    type: [Number],
    required: [true, "A location must have valid coordinates"],
    validate: {
      validator: (value) => {
        const validationResult = validateGeoJsonCoordinates(value);
        return validationResult === true;
      },
      message: (props) => validateGeoJsonCoordinates(props.value),
    },
  },
});

export default pointSchema;
