const mongoose = require("mongoose");

// Define the schema for the address
const addressSchema = new mongoose.Schema({
  HNo: String,
  apartmentName: String,
  street: String,
  landmark: String,
  pincode: String,
});

const profileSchema = new mongoose.Schema({
  nickname: String,
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cities",
  },
  clss: Array,
  type: {
    type: String,
  },
  contact: String,
  pincode: String,
  address: addressSchema,
  role: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
});

mongoose.model("Profile", profileSchema);
