const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tuitionType: {
    type: String,
    required: true, // Uncommented this if it's mandatory
  },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  subjects: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  ],
  studentGender: {
    type: String,
    // required: true, // Uncommented this if it's mandatory
  },
  tutorGender: {
    type: String,
    // required: true, // Uncommented this if it's mandatory
  },
  numStudents: {
    type: String,
    // required: true, // Uncommented this if it's mandatory
  },
  days: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Day", required: true }, // Corrected ref if applicable
  ],
  otherRequirement: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the date when a document is created
  },
  isActive: {
    type: Boolean,
    default: true, // Automatically set the status to true when a document is created
  },
});

module.exports = mongoose.model("Booking", BookingSchema);
