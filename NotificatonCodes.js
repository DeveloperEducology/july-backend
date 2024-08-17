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
