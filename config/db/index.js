const mongoose = require("mongoose");
const { DB_USER, DB_PASS } = require("../");

mongoose.set('strictQuery', true);
mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PASS}@magicpost.c17ghyd.mongodb.net/?retryWrites=true&w=majority`
);

//mongodb+srv://MagicPost:12345@magicpost.c17ghyd.mongodb.net/?retryWrites=true&w=majority

module.exports = mongoose;
