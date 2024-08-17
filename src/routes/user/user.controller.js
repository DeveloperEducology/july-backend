const UserModel = require("../../modals/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const twilio = require("twilio");

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const serviceSid = process.env.TWILIO_SERVICE_SID; // You can create a Verify Service in the Twilio console and get this SID
// const client = twilio(accountSid, authToken);

const clientId = "LRDFECK0815DHLLSN7KLJ7NU18YCOYMG";
const clientSecret = "mssp9lfiqnj2rtm4jfx331csaeoynmm4";
let storedOtp = null;
let orderId = null;
let phoneNumber = null;

const createUser = async (req, res) => {
  const { email, userName, password, userType, userId, phoneNumber } = req.body;

  try {
    let checkUser = await UserModel.findOne({
      $or: [{ email: email }, { userName: userName }],
    });

    if (!checkUser) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      let result = await UserModel.create({
        ...req.body,
        password: passwordHash,
        userId: userId,
      });

      const token = jwt.sign(
        { user_id: result?._id, email },
        process.env.TOKEN_KEY
      );
      result.token = token;

      res.send({
        data: result,
        message: "User created successfully...!!!",
        status: true,
      });
    } else {
      res.status(403).json({ status: false, message: "User already exists" });
    }
  } catch (error) {
    console.log("Error raised", error);
    res.status(403).json({ status: false, error: error });
  }
};

const loginUser = async (req, res) => {
  const { email, password, fcmToken } = req.body;

  console.log("req.body", req.body);

  try {
    const user = await UserModel.findOne({ email: email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign(
          { user_id: user._id, email: user.email },
          process.env.TOKEN_KEY,
          { expiresIn: "2h" } // Token expires in 2 hours
        );

        if (fcmToken) {
          user.fcmToken = fcmToken;
          await user.save();
        }

        const userWithoutPassword = {
          ...user.toObject(),
          token,
        };
        delete userWithoutPassword.password;

        res.send({
          data: userWithoutPassword,
          status: true,
        });
      } else {
        res
          .status(403)
          .json({ status: false, error: "Password/email not correct" });
      }
    } else {
      res
        .status(403)
        .json({ status: false, error: "Password/email not correct" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

const loginWithPhone = async (req, res) => {
  const { phoneNumber, fcmToken } = req.body;

  console.log("req.body", req.body);

  try {
    const user = await UserModel.findOne({ phoneNumber });

    if (user) {
      await client.verify.services(serviceSid).verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

      if (fcmToken) {
        user.fcmToken = fcmToken;
        await user.save();
      }

      res.send({
        status: true,
        message: "OTP sent successfully. Please verify to complete login.",
      });
    } else {
      res.status(404).json({ status: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

const fetchAllUsers = async (req, res) => {
  try {
    let data = await UserModel.find({});
    res.send({
      data: data,
      status: true,
    });
  } catch (error) {
    res.status(403).json({ status: false, error: error });
  }
};

const fetchUserDetails = async (req, res) => {
  const { userId } = req.query;
  try {
    let data = await UserModel.findOne({ _id: userId }).select("-password");
    console.log("data", data);
    res.send({
      data: data,
      status: true,
    });
  } catch (error) {
    res.status(403).json({ status: false, error: error });
  }
};

const fetchUsersByIds = async (req, res) => {
  const userId = req.params.id; // Assuming userId is passed as a URL parameter

  try {
    const user = await UserModel.findOne({ userId });
    if (!user) {
      return res.status(404).send({
        message: `User with id=${userId} not found.`,
      });
    }

    res.send(user);
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving user information with userId=" + userId,
    });
  }
};

const update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update cannot be empty!",
    });
  }

  const id = req.params.id;

  try {
    // Debugging info
    console.log("req.files:", req.files);
    console.log("req.body before update:", req.body);

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const media = req.files.map((val) => {
        return {
          type: val.mimetype == "video/mp4" ? "video" : "image",
          url: val.location, // Assuming the file path is stored in `location`
        };
      });

      // Ensure media field is in the profile object
      if (!req.body.profile) {
        req.body.profile = {};
      }
      req.body.profile.media = media;
    }

    // Log the modified req.body
    console.log("req.body after file handling:", req.body);

    // Add hasProfile: true to the user object
    // req.body.hasProfile = true;

    const updatedSection = req.body;

    // Update the user
    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    console.log("updateduser", updatedUser);

    // Check if user was found and updated
    if (!updatedUser) {
      return res.status(404).send({
        message: `Cannot update user profile with id=${id}. Maybe user was not found!`,
      });
    }

    // Save the updated user
    await updatedUser.save();

    // Send updated user info
    res.send(updatedUser);
    console.log("saved user", updatedUser.profile);
  } catch (err) {
    // Log error and send response
    console.error("Error updating user profile:", err);
    res.status(500).send({
      message: "Error updating user profile with id=" + id,
    });
  }
};

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

    const existingProfile = await UserModel.findOne({ userId: userId });
    if (existingProfile) {
      return res
        .status(400)
        .json({ status: false, message: "User already has a tuition profile" });
    }

    const newUserProfile = new UserModel({
      // userId,
      availability,
      otherInfo,
      experience,
      education,
      personalInformation,
      emergencyInformation,
    });

    const savedProfile = await newUserProfile.save();
    // await UserModel.findByIdAndUpdate(userId, { hasProfile: true });

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

const sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Check if the user exists
    const user = await UserModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        message: "User does not have an account for this number",
        success: false,
      });
    }

    // Send OTP
    const response = await axios.post(
      "https://auth.otpless.app/auth/otp/v1/send",
      {
        phoneNumber,
        otpLength: 4,
        channel: "SMS",
        expiry: 180,
      },
      {
        headers: {
          clientId: clientId,
          clientSecret: clientSecret,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract orderId from the response
    const { orderId, otp } = response.data;

    // Store orderId and OTP as needed
    res.json({ orderId, success: true });
  } catch (error) {
    console.error(
      "Error sending OTP:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  const { otp } = req.body;

  try {
    const response = await axios.post(
      "https://auth.otpless.app/auth/otp/v1/verify",
      {
        orderId: orderId,
        otp: otp,
        phoneNumber: phoneNumber, // Include phone number
      },
      {
        headers: {
          clientId: clientId,
          clientSecret: clientSecret,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response veife", response.data.isOTPVerified);
    if (response.data.isOTPVerified) {
      let user = await UserModel.findOne({ phoneNumber });

      if (!user) {
        // If the user doesn't exist, create a new one
        user = new UserModel({ phoneNumber });
        await user.save();
      }

      // Generate a JWT token
      const token = jwt.sign(
        { user_id: user._id, phoneNumber: user.phoneNumber },
        process.env.TOKEN_KEY,
        { expiresIn: "2h" }
      );

      const userWithoutSensitiveInfo = {
        ...user.toObject(),
        token,
      };
      delete userWithoutSensitiveInfo.password;

      // Clear stored OTP and orderId after successful verification
      storedOtp = null;
      orderId = null;
      console.log(userWithoutSensitiveInfo);
      res.json({ data: userWithoutSensitiveInfo, success: true });
    } else {
      res.status(400).json({ success: false, message: response.data.reason });
    }
  } catch (error) {
    console.error(
      "Error verifying OTP:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

module.exports = {
  // fileUpload,
  createUser,
  loginUser,
  fetchAllUsers,
  fetchUserDetails,
  fetchUsersByIds,
  update,
  create,
  loginWithPhone,
  sendOTP,
  verifyOTP,
};
