const mongoose = require("mongoose");

const ApplyBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the date when a document is created
  },
});

module.exports = mongoose.model("ApplyBooking", ApplyBookingSchema);
