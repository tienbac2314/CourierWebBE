const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../../middleware/user");
const Package = require("../../middleware/package");
const Exchange = require("../../middleware/exchange");
const Gathering = require("../../middleware/gathering");


// ROUTES * /api/auth/
router.post("/login", User.loginUser);
router.get("/logout", User.logoutUser);
router.post("/role", User.requireAuth);

// Check user on every path
router.get('*', User.checkUser);
router.post('*', User.checkUser);

//user
router.post("/register", User.userRoleAuth("manager_exchange", 1), User.signUpUser);
router.post("/delete_user_by_id", User.userRoleAuth("manager_exchange", 1), User.deleteUserById);
router.post("/update_user_by_id", User.userRoleAuth("manager_exchange", 1), User.updateUserById);
router.get("/get_user_by_id/:_id", User.userRoleAuth("employee_exchange", 1), User.getUserById);
router.get("/manageEmployee", User.userRoleAuth("manager_exchange", 1), User.manageEmployee);

//package
router.post("/add_package", User.userRoleAuth("employee_exchange"), Package.addNewPackage);
router.post("/update_package_by_id", User.userRoleAuth("employee_gather", -1), Package.updatePackageById);
router.post("/delete_package_by_id", User.userRoleAuth("employee_exchange"), Package.deletePackageById);
router.get("/get_package_by_id/:_id", Package.getPackageById);

router.get('/packages/:pointId', User.userRoleAuth("ceo", -1), Package.listPackagesByPoint);
router.get('/all_packages/', User.userRoleAuth("employee_exchange", 1), Package.listAllPackages);
router.get('/packages/queued/incoming', User.userRoleAuth("employee_gather", -1), Package.listIncomingQueuedPackages);
router.get('/packages/queued/outgoing', User.userRoleAuth("employee_gather", -1), Package.listOutgoingQueuedPackages);
router.get('/current_packages/:pointId', User.userRoleAuth("manager_exchange", 1), Package.listInorOutPackagesByPoint);
router.get('/all_packages/:year', User.userRoleAuth("manager_exchange", 1), Package.listPackagesByMonth);
router.get('/recent_packages/', User.userRoleAuth("manager_exchange", 1), Package.listFiveRecentPackages);

//exchange ( diem giao dich)
router.post("/add_exchange", User.userRoleAuth("ceo"), Exchange.addNewExchange);
router.post("/update_exchange_by_id", User.userRoleAuth("ceo"), Exchange.updateExchangeById);
router.post("/delete_exchange_by_id", User.userRoleAuth("ceo"), Exchange.deleteExchangeById);
router.get("/get_exchange_by_gather/:_id", User.userRoleAuth("ceo"), Exchange.getExchangeByGather);
router.get("/get_all_exchange", User.userRoleAuth("employee_exchange"), Exchange.getAllExchange);

//gathering ( diem tap ket)
router.post("/add_gathering", User.userRoleAuth("ceo"), Gathering.addNewGathering);
router.post("/update_gathering_by_id", User.userRoleAuth("ceo"), Gathering.updateGatheringById);
router.post("/delete_gathering_by_id", User.userRoleAuth("ceo"), Gathering.deleteGatheringById);
router.get("/get_gathering_by_id/:_id", User.userRoleAuth("ceo"), Gathering.getGatheringById);
router.get("/get_all_gathering", User.userRoleAuth("ceo"), Gathering.getAllGathering);
module.exports = router;
