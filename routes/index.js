const express = require("express");
const auth = require("./auth");
const router = express.Router();

// AUTH Routes * /api/auth/*
router.use("/auth", auth);

module.exports = router;
