const mongoose = require("mongoose");
const schemaType = require("../../types");

const exchangeSchema = new mongoose.Schema(
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
    gathering: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gathering",
    }
  },
  { timestamps: true }
);

module.exports = exchangeSchema;
