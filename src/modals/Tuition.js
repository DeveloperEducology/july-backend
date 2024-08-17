const mongoose = require("mongoose");

const TuitionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: {
    type: String,
    // required: true,
  },
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

module.exports = mongoose.model("Tuition", TuitionSchema);
