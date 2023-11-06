const express = require("express");
const auth = require("./auth");
const user = require("./user-type");
const router = express.Router();

// AUTH Routes * /api/auth/*
router.use("/auth", auth);

module.exports = router;
