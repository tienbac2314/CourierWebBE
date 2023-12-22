const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET } = require("../../config");
const { insertNewDocument, findOne, findOneAndSelect } = require("../../helpers");
const Joi = require("joi");
const Exchange = require("../../models/exchange/index");
const Gathering = require("../../models/gathering/index");
const user = require("../../models/user/index");
const moment = require('moment');
const { ObjectID } = require("../../types");
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
  phone: Joi.string().required(),
});


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, SECRET, { expiresIn: maxAge });
};

const signUpUser = async (req, res) => {
  console.log(req.body);
  const { name, email, password, phone, dob, gender } = req.body;
  try {
    // const validate = await schema.validateAsync(req.body);

    const check_user_exist = await findOne("user", { email });
    if (check_user_exist) {
      return res
        .status(404)
        .send({ status: 404, message: "User already exist!" });
    }

    const new_user = {
      name,
      email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      phone,
      dob,
      gender,
    };
    const user = await insertNewDocument("user", new_user);
    let token = createToken({id: new_user._id})
    user.password = undefined;
    
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).send({ status: 200, user, token });
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
};

const schema1 = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
  });
  
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      const validate = await schema1.validateAsync(req.body);
      const user = await findOneAndSelect(
        "user",
        { email },
        "name email password role exchange gathering"
      );
      if (user) {
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
          return res
            .status(404)
            .send({ status: 404, message: "Invalid Email or Password!" });
        }
        user.password = undefined;

        let token = createToken({ id: user._id});

        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.cookie('role', user.role, { httpOnly: true, maxAge: maxAge * 1000 });
        res.cookie('workplace', (user.exchange || user.gathering)?.toString(), { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).send( {status: 200, message: user.name, role: user.role });
      } else {
        return res
          .status(404)
          .send({ status: 404, message: "User does not exist!" });
      }
    } catch (err) {
      // const e = handleErrors(err);
      res.status(400).send({ status: 400, message: err });
    }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.cookie('role', '', { maxAge: 1 });
    res.cookie('workplace', '', { maxAge: 1 });
    res.status(200).send("log out successfully");
  } catch (err) {
    const e = handleErrors(err);
    res.status(404).send({ status: 404, message: e.message });
  }
};

// protect routes that need higher role/user logged in
const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
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
        let currentUser = await user.findById(decodedToken.id.id);
        let currentRole = currentUser.role;
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

const updateUserById = async (req,res) => {
    try {
        const { _id, ...updatedData } = req.body;
        const currentUserRole = req.cookies.role;
        const targetedUser = await user.findById(_id);

        if (hasPermission(currentUserRole, targetedUser.role, 0)){
          const updatedUser = await user.findByIdAndUpdate(_id, updatedData, { new: true });

          if (!updatedUser) {
          return res.status(404).send({ status: 404, message: 'User not found' });
          }

          return res.status(200).send({ status: 200, user: updatedUser });

        } else {
          return res.status(403).send(`${currentUserRole} does not have permissions for ${targetedUser.role}`);
        }
      } catch (e) {
        res.status(400).send({ status: 400, message: e.message });
      }
}

const deleteUserById = async (req,res) => {
    try {
      if (hasPermission(targetedUser.role, currentUserRole , 0)){
        const filter = { _id: req.body._id };
        const deleteUser = await user.deleteOne(filter);
    
        if (!deleteUser) {
          return res.status(404).send({ status: 404, message: 'User not found' });
        }
        
        return res.status(200).send({ status: 200, user: deleteUser });
      }
      } catch (e) {
        res.status(400).send({ status: 400, message: e.message });
    }
};

const manageEmployee = async (req, res) => {
  try {
  let filter = undefined;
  switch (req.cookies.role) {
    case 'ceo':
      filter = { $or: [{ role: 'manager_gather' }, { role: 'manager_exchange' }] };
      break;
    case 'manager_gather':
      filter = { gathering: req.cookies.workplace, role: 'employee_gather'};
      break;
    case 'manager_exchange':
      filter = { exchange: req.cookies.workplace, role: 'employee_exchange'};
      break;
  }

  const listEmployee = await user.find(filter);

    const simplifiedList = listEmployee.map(employee => ({
      id: employee._id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
      dob: moment(employee.dob).format('DD-MM-YYYY'),
      gender: employee.gender,
      // variables
    }));

    return res.status(200).send({ status: 200, employee: simplifiedList });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message});
  }
};

const getManagerGather = async (id) => {
  const response = user.findOne({
    gathering: new ObjectID(id),
    role:"manager_gather",
  })
  if(response) {
    return response;
  }
  return "Unknown";
}
module.exports = {
    signUpUser,
    loginUser,
    logoutUser,
    requireAuth,
    userRoleAuth,
    checkUser,
    updateUserById,
    deleteUserById,
    manageEmployee,
    getManagerGather,
};