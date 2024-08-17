const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const profile_controller = require("./profile.controller");
const uploadMiddleWare = require("../../middleware/fileUpload");

router.post(
  "/fileUpload",
  uploadMiddleWare.single("file"),
  profile_controller.fileUpload
);

router.post(
  "/create-profile",
  auth,
  uploadMiddleWare.array("file", 5),
  profile_controller.create
);

// Get a single profile profile by ID
router.get("/get-profile/:id", profile_controller.getById);

// Update a profile profile (requires authentication)
router.put(
  "/update-profile/:id",
  auth,
  uploadMiddleWare.array("file", 5),
  profile_controller.update
);

// Get all profile profiles
router.get("/profiles", profile_controller.getAll);

// Get user info by profile profile ID (change route to avoid conflict)
router.get("/profile/:id", auth, profile_controller.getUserInfoByProfileId);
router.get("/profile-detail/:id", profile_controller.getInfoByProfileId1);
router.get("/profile-categories/:id", profile_controller.profileCategories);

module.exports = router; // Corrected from `module. Exports` to `module.exports`
