const mongoose = require("mongoose");
const userTypeSchema = require("./user-type.schema");

const userType = mongoose.model("user-type", userTypeSchema);

module.exports = userType;
