const mongoose = require("mongoose");
const schemaType = require("../../types");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: schemaType.TypeString,
      required: true,
    },
    email: {
      type: schemaType.TypeString,
      required: true,
      unique: true,
    },
    password: {
      type: schemaType.TypeString,
      required: true,
    },
    phone: {
      type: schemaType.TypeString,
      // required: true,
    },
    role: {
      type: schemaType.TypeString,
      default: "customer", //employee_exchange,employee_gather,CEO,manager_exchange,manager_gather,customer
    },
  },
  { timestamps: true }
);

module.exports = userSchema;
