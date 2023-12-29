const jwt = require("jsonwebtoken");
const { SECRET } = require("../../config");
const User = require("../../models/user/index");
const Gathering = require("../../models/gathering/index");
const Exchange = require("../../models/exchange/index");
const mongoose = require("mongoose");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, SECRET, { expiresIn: maxAge });
};

// bảo vệ định tuyến cần quyền/đã đăng nhập
const requireAuth = (req, res) => {
  const token = req.body.jwt;
  if (token) {
    jwt.verify(token, SECRET, async (err, decodedToken) => {
      if (err) {
        res.cookie('role', '', {maxAge: maxAge * 1});
        res.cookie('workplace', '', {maxAge: maxAge * 1});
        res.status(404).send({ status: 404, message: err.message });
      } else {
        let currentUser = await User.findById(decodedToken.id.id);
        let currentRole = currentUser.role;
        res.status(200).send({ status: 200, role: currentRole });
      }
    });
  } else {
    res.cookie('role', '', {maxAge: maxAge * 1});
    res.cookie('workplace', '', {maxAge: maxAge * 1});
    res.status(404).send({ status: 404, message: "Bad request" });
  }
};

const roles = {
  ceo: ['manager_gather', 'manager_exchange', 'employee_gather', 'employee_exchange', 'customer', 'ceo'],
  manager_gather: ['manager_exchange', 'employee_gather', 'customer'],
  manager_exchange: ['employee_exchange', 'customer'],
  employee_gather: ['employee_exchange'],
  employee_exchange: [],
};

const hasPermission = (userRole, requestedRole, above = 0) => {
  if (userRole === null) return false;
  if (userRole === requestedRole.toLowerCase()) return true;
  
  const lowerRoles = roles[requestedRole.toLowerCase()];
  if (!lowerRoles || !Array.isArray(lowerRoles)) return false;

  if (above === -1){
    if (lowerRoles.includes(userRole)) return true;
  } else if (above === 1) {
    if (lowerRoles.includes(userRole)) return false;
    return true;
  } else {
    return false;
  }
};

const userRoleAuth = (requiredRole, above = 0) => {
  return async (req, res, next) => {
    const userRole = req.cookies.role;

    if (!roles['ceo'].includes(userRole)){
      return res.status(403).send('role unidentified');
    }

    if (userRole == null) {
      return res.status(403).send('does not have permissions ');
    }
    if (hasPermission(userRole.toLowerCase(), requiredRole, above)) {
      next();
    } else {
      return res.status(403).send(`${userRole} does not have permissions for ${requiredRole}`);
    }
  };
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, SECRET, async (err, decodedToken) => {
      if (err) {
        res.cookie('role', '', {maxAge: maxAge * 1});
        res.cookie('workplace', '', {maxAge: maxAge * 1});
        next();
      } else {
        let currentUser = await User.findById(decodedToken.id.id);
        let currentRole = await currentUser.role;
        res.cookie('role', currentRole, { httpOnly: true, maxAge: maxAge * 1000 });
        res.cookie('workplace', (currentUser.exchange || currentUser.gathering)?.toString(), { httpOnly: true, maxAge: maxAge * 1000 });
        next();
      }
    });
  } else {
    res.cookie('role', '', {maxAge: maxAge * 1});
    res.cookie('workplace', '', {maxAge: maxAge * 1});
    next();
  }
};

// thay đổi trưởng điểm
const updateWorkplace = async (workplace_type, workplaceId, userId) => {
  try {
    
    // Lấy thông tin trưởng cũ và xoá tham chiếu nơi làm việc cũ
    let oldManager;
    let currentWorkplace;
    if (workplace_type === 'exchange'){
      currentWorkplace = Exchange.findById(workplaceId);
      oldManager = User.findByIdAndUpdate(
        currentWorkplace.manager,
        { role: 'employee_exchange' },
        { new: true }
      );
    } else if (workplace_type === 'gathering'){
      currentWorkplace = Gathering.findById(workplaceId);
      oldManager = User.findByIdAndUpdate(
        currentWorkplace.manager,
        { role: 'employee_gather' },
        { new: true }
      );
    }

    // Cập nhật thông tin mới cho người dùng
    const updatedManager = await User.findByIdAndUpdate(userId, { [workplace_type]: workplaceId }, { new: true });

    if (!updatedManager) {
      console.error('User not found');
    }

    return oldManager;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

module.exports = {
  createToken,
  requireAuth,
  userRoleAuth,
  checkUser,
  updateWorkplace,
};