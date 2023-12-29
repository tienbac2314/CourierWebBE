const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const user = require("../../controller/user");
const userMiddleware = require("../../middleware/user");
const package = require("../../controller/package");
const packageMiddleware = require("../../middleware/package");
const exchange = require("../../controller/exchange");
const exchangeMiddleware = require("../../middleware/exchange");
const gathering = require("../../controller/gathering");
const gatheringMiddleware = require("../../middleware/gathering");


// ROUTES * /api/auth/
router.post("/login", user.loginUser);
router.get("/logout", user.logoutUser);
router.post("/role", userMiddleware.requireAuth);

// Check user on every path
router.get('*', userMiddleware.checkUser);
router.post('*', userMiddleware.checkUser);

//user
router.post("/register", userMiddleware.userRoleAuth("manager_exchange", 1), user.signUpUser);
router.post("/delete_user_by_id", userMiddleware.userRoleAuth("manager_exchange", 1), user.deleteUserById);
router.post("/update_user_by_id", userMiddleware.userRoleAuth("manager_exchange", 1), user.updateUserById);
router.get("/get_user_by_id/:_id", userMiddleware.userRoleAuth("employee_exchange", 1), user.getUserById);
router.get("/manageEmployee", userMiddleware.userRoleAuth("manager_exchange", 1), user.manageEmployee);
router.get("/get_all_employees", userMiddleware.userRoleAuth("ceo"), user.getAllEmployeeUsers);

//package
router.post("/add_package", userMiddleware.userRoleAuth("employee_exchange"), package.addNewPackage);
router.post("/update_package_by_id", userMiddleware.userRoleAuth("employee_gather", -1), package.updatePackageById);
router.post("/delete_package_by_id", userMiddleware.userRoleAuth("employee_exchange"), package.deletePackageById);
router.get("/get_package_by_id/:_id", package.getPackageById);

router.get('/packages/:pointId', userMiddleware.userRoleAuth("ceo", -1), package.listPackagesByPoint);
router.get('/all_packages/', userMiddleware.userRoleAuth("employee_exchange", 1), package.listAllPackages);
router.get('/packages/queued/incoming', userMiddleware.userRoleAuth("employee_gather", -1), package.listIncomingQueuedPackages);
router.get('/packages/queued/outgoing', userMiddleware.userRoleAuth("employee_gather", -1), package.listOutgoingQueuedPackages);
router.get('/current_packages/', userMiddleware.userRoleAuth("manager_exchange", 1), package.listInorOutPackagesByPoint);
router.get('/all_packages/:year', userMiddleware.userRoleAuth("manager_exchange", 1), package.listPackagesByMonth);
router.get('/recent_packages/', userMiddleware.userRoleAuth("manager_exchange", 1), package.listFiveRecentPackages);

//exchange ( diem giao dich)
router.post("/add_exchange", userMiddleware.userRoleAuth("ceo"), exchange.addNewExchange);
router.post("/update_exchange_by_id", userMiddleware.userRoleAuth("ceo"), exchange.updateExchangeById);
router.post("/delete_exchange_by_id", userMiddleware.userRoleAuth("ceo"), exchange.deleteExchangeById);
router.get("/get_exchange_by_gather/:_id", userMiddleware.userRoleAuth("ceo"), exchange.getExchangeByGather);
router.get("/get_all_exchange", userMiddleware.userRoleAuth("employee_exchange"), exchange.getAllExchange);

//gathering ( diem tap ket)
router.post("/add_gathering", userMiddleware.userRoleAuth("ceo"), gathering.addNewGathering);
router.post("/update_gathering_by_id", userMiddleware.userRoleAuth("ceo"), gathering.updateGatheringById);
router.post("/delete_gathering_by_id", userMiddleware.userRoleAuth("ceo"), gathering.deleteGatheringById);
router.get("/get_gathering_by_id/:_id", userMiddleware.userRoleAuth("ceo"), gathering.getGatheringById);
router.get("/get_all_gathering", userMiddleware.userRoleAuth("ceo"), gathering.getAllGathering);
router.get("/get_all_points", userMiddleware.userRoleAuth("ceo"), gathering.getTotalCounts);
module.exports = router;
