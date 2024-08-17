const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const tuition_controller = require("../tuition/tuition.controller");

// Create a Tuition profile (requires authentication)
router.post("/create-tuition-profile", auth, tuition_controller.create);

// Get a single Tuition profile by ID
router.get("/get-tuition-profile/:id", tuition_controller.getById);

// Update a Tuition profile (requires authentication)
router.put("/tuition-profile/:id",  tuition_controller.update);

// Get all Tuition profiles
router.get("/tuition-profiles", tuition_controller.getAll);

// Get user info by tuition profile ID (change route to avoid conflict)
router.get("/tuition-profile/:id/user-info",auth, tuition_controller.getUserInfoByTuitionId);
router.get("/tuition-profile-userid/:id", tuition_controller.getByUserId);

module.exports = router; // Corrected from `module. Exports` to `module.exports`
