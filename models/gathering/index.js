const mongoose = require("mongoose");
const gatheringSchema = require("./gathering-schema");

const gathering = mongoose.model("gathering", gatheringSchema);

module.exports = gathering;