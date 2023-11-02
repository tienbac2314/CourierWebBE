const mongoose = require("mongoose");
const schemaType = require("../../types");

const packageStatusSchema = new mongoose.Schema(
  {
    date: {
      type: schemaType.TypeDate,
      required: true,
    },
    status: {
        type: schemaType.TypeArray,
        default: "shipping" //shipping,received,no_receive
    },
    exchange_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exchange",
    },
    gathering_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gathering",
    }
  },
  { timestamps: true }
);

module.exports = packageStatusSchema;
