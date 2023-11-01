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
    send_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exchange",
    },
    receive_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exchange",
    }

    // type: {
    //   type: schemaType.ObjectID,
    //   ref: "user-types",
    // },
    // job_id: {
    //   type: schemaType.TypeString,
    // },
    // created_date: {
    //   type: schemaType.TypeDate,
    //   default: Date.now,
    // },
    // locations: {
    //   type: [schemaType.TypeObjectId],
    //   ref: "location",
    // },
  },
  { timestamps: true }
);

module.exports = userSchema;
