const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const booking_controller = require("../booking/booking.controller");

router.post("/create-booking", auth, booking_controller.create);
router.get("/booking/:id", auth, booking_controller.booking);
router.get("/bookings/:id", auth, booking_controller.getAllBookings); // Add this line
router.get("/bookings", auth, booking_controller.getBookings); // Add this line
router.post("/apply-booking/:id", auth, booking_controller.CreateApplyBooking);
router.get("/get-apply-bookings/:id", auth, booking_controller.getAppliedBookings);

module.exports = router; // Corrected from `module. Exports` to `module.exports`
