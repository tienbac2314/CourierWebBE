const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../../middleware/user");
const Package = require("../../middleware/package");
const Exchange = require("../../middleware/exchange");
const Gathering = require("../../middleware/gathering");
router.get("/login", (req, res) => {
    res.sendFile("login.html", { root: './public/shared' })
});
router.get("/register", (req, res) => {
    res.sendFile("register.html", { root: './public/shared' })
});
router.get("/home", (req,res) => {
    if ((req.cookies.role) == ('employee_gather')) {
        res.sendFile("home.html", {root:"./public/employeeGather"})
    }
})
// Check user on every path
router.get('*', User.checkUser);
// ROUTES * /api/auth/
router.post("/login", User.loginUser, User.checkUser);
router.post("/register", User.signUpUser);
router.get("/logout", User.logoutUser);
router.post("/delete_user_by_id", User.userRoleAuth("manager_exchange"), User.deleteUserById);
router.post("/update_user_by_id", User.userRoleAuth("manager_exchange"), User.updateUserById);

//package
router.post("/add_package", User.userRoleAuth("employee_exchange"), Package.addNewPackage);
router.post("/update_package_by_id", User.userRoleAuth("employee_exchange"), Package.updatePackageById);
router.post("/delete_package_by_id", User.userRoleAuth("employee_exchange"), Package.deletePackageById);
router.get("/get_package_by_id", Package.getPackageById);

//exchange ( diem giao dich)
router.post("/add_exchange", User.userRoleAuth("manager_exchange"), Exchange.addNewExchange);
router.post("/update_exchange_by_id", User.userRoleAuth("ceo"), Exchange.updateExchangeById);
router.post("/delete_exchange_by_id", User.userRoleAuth("ceo"), Exchange.deleteExchangeById);
router.get("/get_exchange_by_id", Exchange.getExchangeById);

//gathering ( diem tap ket)
router.post("/add_gathering", User.userRoleAuth("ceo"), Gathering.addNewGathering);
router.post("/update_gathering_by_id", User.userRoleAuth("ceo"), Gathering.updateGatheringById);
router.post("/delete_gathering_by_id", User.userRoleAuth("ceo"), Gathering.deleteGatheringById);
router.get("/get_gathering_by_id", Gathering.getGatheringById);
module.exports = router;
