// 1. Storing FCM Tokens in the Database

const mongoose = require("mongoose");

// Define a schema for your users
const userSchema = new mongoose.Schema({
  email: String,
  fcmToken: String, // Store the FCM token
});

// Create a model for users
const User = mongoose.model("User", userSchema);

// Example: Saving an FCM token for a user
const saveUserToken = async (email, fcmToken) => {
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { fcmToken },
      { new: true, upsert: true }
    );
    console.log("FCM token saved:", user);
  } catch (error) {
    console.error("Error saving FCM token:", error);
  }
};

// 2. Retrieving FCM Tokens from the Database

const getUsersTokens = async () => {
  try {
    // Retrieve all users' FCM tokens
    const users = await User.find({}, "fcmToken"); // Only select the fcmToken field
    const tokens = users
      .map((user) => user.fcmToken)
      .filter((token) => !!token); // Get the tokens and filter out any undefined or null tokens

    return tokens;
  } catch (error) {
    console.error("Error retrieving FCM tokens:", error);
    return [];
  }
};

//   3. Using the Tokens to Send Notifications
app.post("/sendPushNotification", async (req, res) => {
  const { title, body } = req.body;

  try {
    // Get all FCM tokens
    const tokens = await getUsersTokens();

    if (tokens.length === 0) {
      return res.status(400).send("No tokens available to send notifications");
    }

    // Send push notification using Firebase Cloud Messaging
    const response = await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title: title,
        body: body,
      },
    });

    console.log("Push notification sent:", response);
    res.status(200).send("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).send("Error sending push notification");
  }
});

//   Send Notifications: Use the /sendPushNotification endpoint to send notifications to all users with stored FCM tokens.

// Postman Request:
// POST http://localhost:5000/sendPushNotification
// Body:
const Example = {
  title: "New Feature Alert!",
  body: "Check out our latest feature in the app.",
};

// twiliog

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const serviceSid = process.env.TWILIO_SERVICE_SID; // You can create a Verify Service in the Twilio console and get this SID
// const client = twilio(accountSid, authToken);

const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Check if a user with this phone number already exists
    let user = await UserModel.findOne({ phoneNumber });

    // If the user exists, return an error message
    if (user) {
      return res
        .status(400)
        .json({ status: false, message: "User already exists. OTP not sent." });
    }

    // If the user does not exist, create a new one
    user = new UserModel({ phoneNumber });
    await user.save();
    console.log("New user created:", user);

    // Send OTP using your SMS service
    await client.verify.services(serviceSid).verifications.create({
      to: phoneNumber,
      channel: "sms",
    });

    res.send({ status: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log("Error sending OTP", error);
    res.status(500).json({ status: false, error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const verification = await client.verify
      .services(serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });

    if (verification.status === "approved") {
      let user = await UserModel.findOne({ phoneNumber });

      if (!user) {
        user = new UserModel({ phoneNumber });
        await user.save();
      }

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

      res.send({ data: userWithoutSensitiveInfo, status: true });
    } else {
      res.status(403).json({ status: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};
