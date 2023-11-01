const mongoose = require("mongoose");
const packageStatusSchema = require("./package-status-schema");

const packageStatus = mongoose.model("packageStatus", packageStatusSchema);

module.exports = packageStatus;