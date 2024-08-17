const TuitionModel = require("../../modals/Tuition");
const UserModel = require("../../modals/user");

// Get all Tuition profiles
const getAll = async (req, res) => {
  try {
    const tuitions = await TuitionModel.find(); // Updated from Tuition.find() to TuitionModel.find()
    res.send(tuitions);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving tuitions.",
    });
  }
};

// Get a single Tuition profile by ID
const getById = async (req, res) => {
  const id = req.params.id;

  try {
    const tuition = await TuitionModel.findById(id);
    if (!tuition) {
      return res.status(404).send({
        message: `Tuition profile with id=${id} not found.`,
      });
    }
    res.send(tuition);
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Tuition profile with id=" + id,
    });
  }
};

// Get user info by user ID from tuition profile
const getUserInfoByTuitionId = async (req, res) => {
  const userId = req.params.id; // Assuming userId is passed as a URL parameter

  try {
    const tuition = await TuitionModel.findOne({ userId });
    if (!tuition) {
      return res.status(404).send({
        message: `Tuition profile with userId=${userId} not found.`,
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        message: `User with id=${userId} not found.`,
      });
    }

    res.send(tuition);
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving user information with userId=" + userId,
    });
  }
};

const getByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await TuitionModel.findOne({ userId });
    if (!result) {
      return res.status(404).send({
        message: `Tuition profile with userId=${userId} not found.`,
      });
    }
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create and Save a new Tuition profile for the logged-in user
const create = async (req, res) => {
  const {
    userId,
    availability,
    otherInfo,
    experience,
    education,
    personalInformation,
    emergencyInformation,
  } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ status: false, message: "userId is required" });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const existingProfile = await TuitionModel.findOne({ userId: userId });
    if (existingProfile) {
      return res
        .status(400)
        .json({ status: false, message: "User already has a tuition profile" });
    }

    const newTuitionProfile = new TuitionModel({
      userId,
      availability,
      otherInfo,
      experience,
      education,
      personalInformation,
      emergencyInformation,
    });

    const savedProfile = await newTuitionProfile.save();
    await UserModel.findByIdAndUpdate(userId, { hasProfile: true });

    res.send({
      data: savedProfile,
      message: "Tuition profile created successfully",
      status: true,
    });
  } catch (error) {
    console.log("Error creating tuition profile", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

// Update a Tuition profile
const update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  try {
    const updatedTuition = await TuitionModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedTuition) {
      return res.status(404).send({
        message: `Cannot update Tuition profile with id=${id}. Maybe Tuition was not found!`,
      });
    }
    res.send(updatedTuition);
  } catch (err) {
    res.status(500).send({
      message: "Error updating Tuition profile with id=" + id,
    });
  }
};

module.exports = {
  create,
  update,
  getAll,
  getById,
  getUserInfoByTuitionId,
  getByUserId,
};
