const BookingModel = require("../../modals/Booking");
const ProfileModel = require("../../modals/Profile");
const ApplyBookingModel = require("../../modals/ApplyBooking");

const create = async (req, res) => {
  try {
    const {
      tuitionType,
      city,
      location,
      category,
      course,
      subjects,
      studentGender,
      tutorGender,
      numStudents,
      days,
      userId,
      otherRequirement,
    } = req.body;

    const newBooking = new BookingModel({
      tuitionType,
      city,
      location,
      category,
      course,
      subjects,
      studentGender,
      tutorGender,
      numStudents,
      days,
      userId,
      otherRequirement,
    });

    const data = await newBooking.save();
    // await BookingModel.findByIdAndUpdate(userId, { hasProfile: true });

    res.send({
      data: data,
      message: "Booking created successfully",
      status: true,
    });
  } catch (error) {
    console.log("Error creating booking", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

const getBooking = async (req, res) => {
  const { bookingId } = req.params.id;
  try {
    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      return { message: "Booking not found" };
    }

    return booking;
  } catch (error) {
    console.error("Error fetching booking details:", error);
    throw error;
  }
};

const booking = async (req, res) => {
  try {
    const userId = req.userId; // Assuming userId is stored in req.userId from authentication middleware
    const bookingId = req.params.id;

    // Fetch the booking with populated fields, filtering by userId
    const bookingDetails = await BookingModel.findOne({
      _id: bookingId,
      userId,
    })
      .populate("city")
      .populate("category")
      .populate("course")
      .populate("subjects")
      .populate("days");

    if (!bookingDetails) {
      return res
        .status(404)
        .json({ message: "Booking not found or not authorized" });
    }

    res.status(200).json(bookingDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking details", error });
  }
};

const filtBookings = async (req, res) => {
  try {
    // Query all tutor profiles to find those with matching otherInfo.location
    const tutorProfiles = await ProfileModel.find({
      "otherInfo.location": { $exists: true },
    });

    const matchingLocationIds = tutorProfiles.map(
      (profile) => profile.otherInfo.location
    );

    // Find bookings with a matching locationId
    const bookings = await BookingModel.find({
      location: { $in: matchingLocationIds },
    })
      .populate("tutorId")
      .populate("studentId")
      .populate("location");

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming userId is stored in req.userId from authentication middleware

    // Fetch all bookings for the authenticated user
    const bookings = await BookingModel.find({ userId })
      .populate("city")
      .populate("location")
      .populate("category")
      .populate("course")
      .populate("subjects")
      .populate("days");

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user" });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

const getBookings = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming userId is stored in req.userId from authentication middleware

    // Fetch all bookings for the authenticated user
    const bookings = await BookingModel.find()
      .populate("city")
      .populate("location")
      .populate("category")
      .populate("course")
      .populate("subjects")
      .populate("days");

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user" });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

const CreateApplyBooking = async (req, res) => {
  try {
    const { bookingId, categoryId, course } = req.body;
    const userId = req.params.id;

    // Fetch the tutor's profile using userId
    const tutor = await ProfileModel.findOne({ userId });

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    const tutorId = tutor._id; // Assign the tutor's profile _id to tutorId

    // Create a new ApplyBooking instance
    const newApplyBooking = new ApplyBookingModel({
      userId,
      bookingId,
      tutorId, // Use the tutor's profile _id
      categoryId,
      course,
    });

    // Save the ApplyBooking to the database
    await newApplyBooking.save();
    console.log(newApplyBooking);
    res.status(201).json({
      message: "ApplyBooking created successfully",
      applyBooking: newApplyBooking,
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: "An error occurred while creating ApplyBooking",
      error: error.message,
    });
  }
};

const getAppliedBookings = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming userId is passed as a route parameter

    const bookings = await ApplyBookingModel.find({ userId })
      .populate({
        path: "bookingId",
        populate: [
          { path: "city" }, // Populate city inside booking
          { path: "location" }, // Populate location inside booking
          { path: "category" }, // Populate category inside booking
          { path: "course" }, // Populate course inside booking
          { path: "subjects" }, // Populate subjects array inside booking
          { path: "days" }, // Populate days array inside booking
        ],
      })
      .populate({
        path: "tutorId",
        populate: [
          { path: "otherInfo.city" }, // Populate city inside otherInfo
          { path: "otherInfo.preferredCategories" }, // Populate preferredCategories inside otherInfo
          { path: "otherInfo.preferredClasses" }, // Populate preferredClasses inside otherInfo
          { path: "otherInfo.preferredSubjects" }, // Populate preferredSubjects inside otherInfo
          { path: "otherInfo.preferredLocations" }, // Populate preferredLocations inside otherInfo
          { path: "address.city" }, // Populate city inside address
        ],
      })
      .populate("categoryId")
      .populate("course");

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No applied bookings found for this user" });
    }

    res.status(200).json({ count: bookings.length, bookings });
  } catch (error) {
    console.error("Error fetching all applied bookings:", error);
    res.status(500).json({ message: "Error fetching applied bookings", error });
  }
};

module.exports = {
  create,
  getBooking,
  booking,
  getAllBookings,
  getBookings,
  filtBookings,
  CreateApplyBooking,
  getAppliedBookings,
};
