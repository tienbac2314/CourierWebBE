const mongoose = require("mongoose");
const exchangeSchema = require("./exchange-schema");

const exchange = mongoose.model("exchange", exchangeSchema);

module.exports = exchange;