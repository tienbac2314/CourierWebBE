const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET } = require("../../config");
const { insertNewDocument, findOne, findOneAndSelect } = require("../../helpers");
const Joi = require("joi");
const User = require("../../models/user/index");
const Exchange = require("../../models/exchange/index");
const Gathering = require("../../models/gathering/index");
const exchangeMiddleware = require("../../middleware/exchange");
const gatheringMiddleware = require("../../middleware/gathering");
const userMiddleware = require("../../middleware/user");
const moment = require('moment');
const { ObjectID } = require("../../types");


const maxAge = 3 * 24 * 60 * 60;

// Check đầu vào lúc đăng ký
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
  phone: Joi.string().length(10),
  dob: Joi.string(),
  gender: Joi.string().valid('male', 'female'),
  workplace: Joi.string(),
  workplace_type: Joi.string(),
});

const signUpUser = async (req, res) => {
  console.log(req.body);
  const { name, email, password, phone, dob, gender} = req.body;
  let {workplace_type, workplace} = req.body;
  try {
    const validate = await schema.validateAsync(req.body);

    const check_user_exist = await findOne("user", { email });
    if (check_user_exist) {
      return res
        .status(404)
        .send({ status: 404, message: "User already exist!" });
    }

    const new_employee = {
      name,
      email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      phone,
      dob,
      gender,
    };

    if ((!workplace) && (!workplace_type)){
      workplace = '0';
      workplace_type = '0';
    }

    let new_user;
    // xét các trường hợp role để add data hợp lý
    switch (req.cookies.role) {
      case "ceo":
        new_user = {
          ...new_employee,
          [workplace_type]: workplace,
          role: workplace_type.includes("exchange") ? "manager_exchange" : workplace_type.includes("gathering") ? "manager_gather" : undefined,
        };
        break;
      case "manager_gather":
          new_user = {
            ...new_employee,
            gathering: req.cookies.workplace,
            role: "employee_gather",
          };
          break;
      case "manager_exchange":
          new_user = {
            ...new_employee,
            exchange: req.cookies.workplace,
            role: "employee_exchange",
          };
          break;
      default:
          break;
    }    
    
    const user = await insertNewDocument("user", new_user);
    user.password = undefined;

    // cập nhật trường manager trên workplace tương ứng
    if (workplace_type === "exchange") {
      await exchangeMiddleware.updateExchangeManager(workplace, user._id);
    } else if (workplace_type === "gathering") {
      await gatheringMiddleware.updateGatheringManager(workplace, user._id);
    }

    res.status(200).send({ status: 200, user });
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
}


//check đầu vào lúc đăng nhập
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

        let token = userMiddleware.createToken({ id: user._id});

        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.cookie('role', user.role, { httpOnly: true, maxAge: maxAge * 1000 });
        res.cookie('workplace', (user.exchange || user.gathering)?.toString(), { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).send( {status: 200, message: user.name, role: user.role, jwt:token });
      } else {
        return res
          .status(404)
          .send({ status: 404, message: "User does not exist!" });
      }
    } catch (e) {
      res.status(400).send({ status: 400, message: e.message });
    }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.cookie('role', '', { maxAge: 1 });
    res.cookie('workplace', '', { maxAge: 1 });
    res.status(200).send("log out successfully");
  } catch (e) {
    res.status(404).send({ status: 404, message: e.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const searchedUser = await User.findById(req.param._id);

    if (!searchedUser) {
      return res.status(404).send({ status: 404, message: 'User not found' });
    }

    return res.status(200).send({ status: 200, user: searchedUser });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

// thống kê tất cả user role employee
const getAllEmployeeUsers = async (req, res) => {
  try {
    const employeeUsers = await User.find(
      { role: { $regex: /employee/i } },
      { _id: 1, name: 1, email: 1 }
    );

    return res.status(200).send({ status: 200, employees: employeeUsers });
  } catch (error) {
    console.error('Error getting employee users:', error.message);
    throw error;
  }
};

const updateUserById = async (req,res) => {
    try {
        const { _id, ...updatedData } = req.body;
        const currentUserRole = req.cookies.role;
        const targetedUser = await User.findById(_id);

        if (userMiddleware.hasPermission(currentUserRole, targetedUser.role, 0)){
          const updatedUser = await User.findByIdAndUpdate(_id, updatedData, { new: true });

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
      if (userMiddleware.hasPermission(targetedUser.role, currentUserRole , 0)){
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

// thống kê nhân viên dựa theo role và nơi làm việc
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

  const listEmployee = await User.find(filter);

  const simplifiedList = listEmployee.map(employee => ({
    id: employee._id,
    email: employee.email,
    name: employee.name,
    role: employee.role,
    dob: moment(employee.dob).format('DD-MM-YYYY'),
    gender: employee.gender,
    // variables
  }));

    return res.status(200).send({ status: 200, employee: simplifiedList, employee_count: simplifiedList.length });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message});
  }
};

const getManagerGather = async (id) => {
  const response = User.findOne({
    gathering: new ObjectID(id),
    role:"manager_gather",
  })
  if(response) {
    return response;
  }
  return "Unknown";
}

const getManagerExchange = async (id) => {
  const response = User.findOne({
    exchange: new ObjectID(id),
    role:"manager_exchange",
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
    getUserById,
    getAllEmployeeUsers,
    updateUserById,
    deleteUserById,
    manageEmployee,
    getManagerGather,
    getManagerExchange,
};