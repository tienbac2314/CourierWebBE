const mongoose = require("mongoose");
const schemaType = require("../../types");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: schemaType.TypeString,
      required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", 
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    sendDate: {
      type: schemaType.TypeString,
    },
    receiveDate: {
        type: schemaType.TypeString,
    },
    status: { 
        type: schemaType.TypeString,
        default: "exchange1", // exchange1-gather1, gather1-gather2, gather2-exchange2, received, no-received
    },
    weight: {
        type: schemaType.TypeDecimal
    },
    exchange1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exchange",
    },
    gathering1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "gathering",
    },
    gathering2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "gathering",
    },
    exchange2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exchange",
    },
  },
  { timestamps: true }
);

module.exports = packageSchema;
