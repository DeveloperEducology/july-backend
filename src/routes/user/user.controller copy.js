const UserModel = require("../../modals/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const fileUpload = async (req, res) => {
  if (!req?.file) {
    res.status(403).json({ status: false, error: "please upload a file" });
    return;
  }
  let data = {};
  if (!!req?.file) {
    data = {
      url: req.file.location,
      type: req.file.mimetype,
    };
  }
  try {
    res.send({
      data: data,
      status: true,
    });
  } catch (error) {
    res.status(403).json({ status: false, error: error });
  }
};

const createUser = async (req, res) => {
  const { email, userName, password, userType } = req.body;

  try {
    let checkUser = await UserModel.findOne({
      $or: [{ email: email }, { userName: userName }],
    });

    if (!checkUser) {
      const salt = await bcrypt.genSalt();
      const passowrdHash = await bcrypt.hash(password, salt);

      let result = await UserModel.create({
        ...req.body,
        password: passowrdHash,
      });

      const token = jwt.sign(
        { user_id: result?._id, email },
        process.env.TOKEN_KEY
      );
      result.token = token;

      res.send({
        data: result,
        message: "User created succesfully...!!!",
        status: true,
      });
    } else {
      res.status(403).json({ status: false, message: "user already exist" });
    }
  } catch (error) {
    console.log("error raised", error);
    res.status(403).json({ status: false, error: error });
  }
};

const loginUser = async (req, res) => {
  const { email, password, fcmToken } = req.body;

  console.log("req.body", req.body);

  try {
    const result = await UserModel.findOne({ email: email });
    if (!!result) {
      let isPasswordValid = await bcrypt.compare(password, result.password);
      if (!!isPasswordValid) {
        const token = jwt.sign(
          { user_id: result?._id, email },
          process.env.TOKEN_KEY
        );

        if (!!fcmToken) {
          result.fcmToken = fcmToken;
          result.save();
        }
        const deepCopy = JSON.parse(JSON.stringify(result));
        deepCopy.token = token;
        delete deepCopy.password;
        console.log(deepCopy);
        res.send({
          data: deepCopy,
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
    res.status(403).json({ status: false, error: error });
  }
};

const otpVerify = async (req, res) => {
  const { email, otp } = req.body;
  if (otp === "1234") {
    try {
      const result = await UserModel.findOneAndUpdate(
        { email: email },
        { $set: { validOTP: true } },
        { new: true }
      ).select("-password");
      if (!!result) {
        res.send({
          data: result,
          status: true,
        });
      } else {
        res.status(403).json({ status: false, error: "User not found" });
      }
    } catch (error) {
      res.status(403).json({ status: false, error: error });
    }
  } else {
    res.status(403).json({ status: false, error: "Otp not valid" });
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
          url: val.location, // Assuming the file path is stored in `path`
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

    // Update the user
    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // Check if user was found and updated
    if (!updatedUser) {
      return res.status(404).send({
        message: `Cannot update user profile with id=${id}. Maybe user was not found!`,
      });
    }

    // Send updated user info
    res.send(updatedUser);
  } catch (err) {
    // Log error and send response
    console.error("Error updating user profile:", err);
    res.status(500).send({
      message: "Error updating user profile with id=" + id,
    });
  }
};

module.exports = {
  fileUpload,
  createUser,
  loginUser,
  otpVerify,
  fetchAllUsers,
  fetchUserDetails,
  fetchUsersByIds,
  update,
};
