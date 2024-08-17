const mongoose = require("mongoose");

// Address schema definition
const AddressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String },
});

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ["image", "video"], required: false },
  url: { type: String, required: false },
});


// Tuition schema definition
const profileSchema = new mongoose.Schema({
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: {
    type: String,
    // required: true,
  },
  media: [mediaSchema],
  availability: {
    days: [String],
    city: String,
    time: String,
    location: String,
    preferredLocations: [String],
    salary: Number,
    tutoringStyles: [String],
    tutoringMethod: String,
  },
  otherInfo: {
    preferredCategories: [String],
    preferredClasses: [String],
    preferredSubjects: [String],
    placeOfTutoring: String,
  },
  experience: {
    totalExperience: String,
    experienceDetails: String,
  },
  education: {
    levelOfEducation: String,
    degreeTitle: String,
    majorGroup: String,
    instituteCollegeName: String,
    percentage: Number,
    yearOfPassing: Number,
    fromDate: Date,
    toDate: Date,
    currentCollege: String,
  },
  personalInformation: {
    email: String,
    additionalNumber: String,
    address: String,
    gender: String,
    dateOfBirth: Date,
    religion: String,
    identityType: String,
    nationality: String,
    fathersName: String,
    fathersNumber: String,
    mothersName: String,
    mothersNumber: String,
    overview: String,
  },
  emergencyInformation: {
    name: String,
    number: String,
    relation: String,
    address: String,
  },
});

// User schema definition
const userSchema = new mongoose.Schema({
  profileImage: {
    type: String,
    default:
      "https://t3.ftcdn.net/jpg/03/64/62/36/360_F_364623623_ERzQYfO4HHHyawYkJ16tREsizLyvcaeg.jpg",
  },
  userName: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: null,
  },
  links: {
    type: Array,
    default: [],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  fcmToken: {
    type: String,
    default: null,
  },
  validOTP: {
    type: Boolean,
    default: false,
  },
  deviceType: {
    type: String,
    default: null,
  },
  token: {
    type: String,
    default: null,
  },
  online: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: null,
  },
  hasProfile: {
    type: Boolean,
    default: false,
  },
  userType: {
    type: String,
    required: true,
  },
  address: AddressSchema, // Adding address schema
  profile: profileSchema, // Embedding Tuition schema
});

module.exports = mongoose.model("User", userSchema);
