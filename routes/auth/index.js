const express = require("express");
const router = express.Router();
const signUp = require("./signup");
const loginUser = require("./login");
// const checkPassword = require("./check-password");
// const { tokenVerification } = require("../../middleware");

router.get("/login", (req, res) => {
    res.sendFile("login.html", { root: './public/' })
});
router.get("/register", (req, res) => {
    res.sendFile("register.html", { root: './public/' })
});
// ROUTES * /api/auth/
router.post("/login", loginUser);
router.post("/register", signUp);
// router.post("/", checkPassword);

module.exports = router;
