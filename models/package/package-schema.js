const mongoose = require("mongoose");
const schemaType = require("../../types");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: schemaType.TypeString,
      required: true,
    },
    sender: {
        type: mongoose.Schema.Types.String, 
    },
    senderPhone: {
      type: mongoose.Schema.Types.String,
    },
    senderAddress: {
      type: mongoose.Schema.Types.String,
    },
    receiver: {
        type: mongoose.Schema.Types.String,
    },
    receiverPhone: {
      type: mongoose.Schema.Types.String,
    },
    receiverAddress: {
      type: mongoose.Schema.Types.String,
    },
    sendDate: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
    receiveDate: {
        type: schemaType.TypeDate,
    },
    status: { 
        type: schemaType.TypeString,
        default: "shipping", // shipping, success, received, no-received
    },
    weight: {
        type: schemaType.TypeString,
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
        type: schemaType.TypeString, //gathering1, gathering2, exchange2, receiver
        default:"gathering1",
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
