const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");
const routes = require("./routes");
const app = express();

// * CookieParser
app.use(cookieParser());

// * Database connection
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("db connected!");
});

const corsOptions = {
  origin: 'http://103.176.147.108:3000', // Replace with your frontend's URL
  credentials: true // Allow credentials (cookies)
};
// * Cors
app.use(cors(corsOptions));

// * Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("short"));

// * Api routes
app.use("/api", routes);

app.get("/hello", (req, res) => {
  res.send("hello");
});

app.use("*", (req, res) => {
  res.send("Route not found");
});

let PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
