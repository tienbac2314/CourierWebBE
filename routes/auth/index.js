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


// ROUTES * /api/auth/
router.post("/login", User.loginUser);
router.post("/register", User.signUpUser);
router.get("/logout", User.logoutUser);

// Check user on every path
router.get('*', User.checkUser);
router.post('*', User.checkUser);

//user
router.post("/delete_user_by_id", User.userRoleAuth("manager_exchange", 1), User.deleteUserById);
router.post("/update_user_by_id", User.userRoleAuth("manager_exchange", 1), User.updateUserById);
router.get("/manageEmployee", User.userRoleAuth("manager_exchange", 1), User.manageEmployee);

//package
router.post("/add_package", User.userRoleAuth("employee_exchange"), Package.addNewPackage);
router.post("/update_package_by_id", User.userRoleAuth("employee_exchange"), Package.updatePackageById);
router.post("/delete_package_by_id", User.userRoleAuth("employee_exchange"), Package.deletePackageById);
router.get("/get_package_by_id/:_id", Package.getPackageById);
router.get('/packages/:pointId', User.userRoleAuth("employee_exchange") && User.userRoleAuth("employee_gather"), Package.listPackagesByPoint);


//exchange ( diem giao dich)
router.post("/add_exchange", User.userRoleAuth("ceo"), Exchange.addNewExchange);
router.post("/update_exchange_by_id", User.userRoleAuth("ceo"), Exchange.updateExchangeById);
router.post("/delete_exchange_by_id", User.userRoleAuth("ceo"), Exchange.deleteExchangeById);
router.get("/get_exchange_by_gather/:_id", User.userRoleAuth("ceo"), Exchange.getExchangeByGather);

//gathering ( diem tap ket)
router.post("/add_gathering", User.userRoleAuth("ceo"), Gathering.addNewGathering);
router.post("/update_gathering_by_id", User.userRoleAuth("ceo"), Gathering.updateGatheringById);
router.post("/delete_gathering_by_id", User.userRoleAuth("ceo"), Gathering.deleteGatheringById);
router.get("/get_gathering_by_id/:_id", User.userRoleAuth("ceo"), Gathering.getGatheringById);
router.get("/get_all_gathering", User.userRoleAuth("ceo"), Gathering.getAllGathering);
module.exports = router;
