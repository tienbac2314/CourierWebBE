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
      type: schemaType.TypeDate,
    },
    receiveDate: {
        type: schemaType.TypeDate,
    },
    status: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "status",
    },
    weight: {
        type: schemaType.TypeDecimal
    },
    send_exchange: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exchange",
    },
    receive__exchange: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exchange",
    },
  },
  { timestamps: true }
);

module.exports = userSchema;
