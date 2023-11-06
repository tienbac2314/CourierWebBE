const express = require("express");
const router = express.Router();
const User = require("../../middleware/user");
const Package = require("../../middleware/package");
const Exchange = require("../../middleware/exchange");
const Gathering = require("../../middleware/gathering");
router.get("/login", (req, res) => {
    res.sendFile("login.html", { root: './public/' })
});
router.get("/register", (req, res) => {
    res.sendFile("register.html", { root: './public/' })
});

// Check user on every path
router.get('*', User.checkUser);

// ROUTES * /api/auth/
router.post("/login", User.loginUser);
router.post("/register", User.signUpUser);
router.get("/logout", User.logoutUser);
router.post("/delete_user_by_id", User.deleteUserById);
router.post("/update_user_by_id", User.updateUserById);

//package
router.post("/add_package", Package.addNewPackage);
router.post("/update_package_by_id", Package.updatePackageById);
router.post("/delete_package_by_id",Package.deletePackageById);
router.get("/get_package_by_id", Package.getPackageById);

//exchange ( diem giao dich)
router.post("/add_exchange", Exchange.addNewExchange);
router.post("/update_exchange_by_id", Exchange.updateExchangeById);
router.post("/delete_exchange_by_id",Exchange.deleteExchangeById);
router.get("/get_exchange_by_id", Exchange.getExchangeById);

//gathering ( diem tap ket)
router.post("/add_gathering", Gathering.addNewGathering);
router.post("/update_gathering_by_id", Gathering.updateGatheringById);
router.post("/delete_gathering_by_id",Gathering.deleteGatheringById);
router.get("/get_gathering_by_id", Gathering.getGatheringById);
module.exports = router;
