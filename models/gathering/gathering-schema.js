const mongoose = require("mongoose");
const schemaType = require("../../types");

const gatheringSchema = new mongoose.Schema(
  {
    name: {
      type: schemaType.TypeString,
      required: true,
    },
    city: {
      type: schemaType.TypeString,
      required: true,
    },
    district: {
      type: schemaType.TypeString,
      required: true,
    },
    street: {
      type: schemaType.TypeString,
      required: true,
    },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    zipcode: {
        type: schemaType.TypeString
    },
  },
  { timestamps: true }
);

module.exports = gatheringSchema;
