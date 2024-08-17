const express = require("express");
const router = express.Router();
const user_controller = require("./user.controller");
const auth = require("../../middleware/auth");
const uploadMiddleWare = require("../../middleware/fileUpload");

router.post("/signup", user_controller.createUser);
router.post("/create", user_controller.create);
router.post("/login", user_controller.loginUser);
router.post("/otp", user_controller.sendOtp);
router.post("/otp-less", user_controller.sendOTP);
router.post("/login-otp", user_controller.loginWithPhone);

router.post("/verifyOtp", user_controller.verifyOtp);
router.post("/verifyOTP-less", user_controller.verifyOTP);
router.get("/fetchUsers", user_controller.fetchAllUsers);
router.get("/fetchUserDetails/:id", user_controller.fetchUserDetails);
// router.get("/fetchUsersByIds", user_controller.fetchUsersByIds);
router.get("/user-profile/:id", user_controller.fetchUsersByIds);
// Update a Tuition profile (requires authentication)
router.put(
  "/user-profile/:id",
  uploadMiddleWare.array("file", 5),
  user_controller.update
);

module.exports = router;
