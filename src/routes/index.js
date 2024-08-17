const express = require("express");
const rootRouter = express.Router();

const users = require("./user/user.route");
const tuition = require("./tuition/tuition.route");
const booking = require("./booking/booking.route");
const profile = require("./profile/profile.route");

rootRouter.use("/", users);
rootRouter.use("/", tuition);
rootRouter.use("/", booking);
rootRouter.use("/", profile);

module.exports = rootRouter;
