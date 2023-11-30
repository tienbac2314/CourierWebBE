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
        default: "shipping", // shipping, success, no-received
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
    qrcode: {
        type: mongoose.Schema.Types.String,
    },
    nextStep: {
        type: schemaType.TypeString, //gather1, gather2, exchange2
        default:"gather1",
    },
    gather1Date: {
        type: schemaType.TypeDate
    },
    gather2Date: {
      type: schemaType.TypeDate
    },
    exchange2Date: {
    type: schemaType.TypeDate
    },
  },
  { timestamps: true }
);

module.exports = packageSchema;
