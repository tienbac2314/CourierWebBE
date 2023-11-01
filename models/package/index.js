const mongoose = require("mongoose");
const packageSchema = require("./package-schema");

const package = mongoose.model("package", packageSchema);

module.exports = package;