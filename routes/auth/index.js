const express = require("express");
const router = express.Router();
const signUp = require("../../middleware/signup");
const loginUser = require("../../middleware/login");
const Package = require("../../middleware/package");

router.get("/login", (req, res) => {
    res.sendFile("login.html", { root: './public/' })
});
router.get("/register", (req, res) => {
    res.sendFile("register.html", { root: './public/' })
});
// ROUTES * /api/auth/
router.post("/login", loginUser);
router.post("/register", signUp);
router.post("/add_package", Package.addNewPackage);
router.post("/update_package_by_id", Package.updatePackageById);
router.post("/delete_package_by_id",Package.deletePackageById);
module.exports = router;
