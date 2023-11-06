const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET } = require("../../config");
const { insertNewDocument, findOne, findOneAndSelect } = require("../../helpers");
const Joi = require("joi");
const { send_email } = require("../../lib");
const user = require("../../models/user/index")

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
  phone: Joi.string().required(),
});

const signUpUser = async (req, res) => {
  console.log(req.body);
  const { name, email, password, phone } = req.body;
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
    };
    const user = await insertNewDocument("user", new_user);
    let token = jwt.sign({ id: new_user._id }, SECRET);
    user.password = undefined;
    send_email(
      "registration-email",
      {
        name: user.name,
        location: "test",
      },
      "Health Titan Pro",
      "Awaiting Admin Approval",
      user.email
    );
    return res.status(200).send({ status: 200, user, token });
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
        "name email password"
      );
      if (user) {
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
          return res
            .status(404)
            .send({ status: 404, message: "Invalid Email or Password!" });
        }
        user.password = undefined;
        var token = jwt.sign({ id: user._id }, SECRET);
        res.status(200).send({ status: 200, user, token });
      } else {
        return res
          .status(404)
          .send({ status: 404, message: "User does not exist!" });
      }
    } catch (e) {
      res.status(400).send({ status: 400, message: e.message });
    }
};

const updateUserById = async (req,res) => {
    try {
        const { _id, ...updatedData } = req.body;
    
        const updatedUser = await user.findByIdAndUpdate(_id, updatedData, { new: true });
    
        if (!updatedUser) {
          return res.status(404).send({ status: 404, message: 'User not found' });
        }
    
        return res.status(200).send({ status: 200, user: updatedUser });
      } catch (e) {
        res.status(400).send({ status: 400, message: e.message });
      }
}

const deleteUserById =async (req,res) => {
    try {
        const filter = { _id: req.body._id };
        const deleteUser = await user.deleteOne(filter);
    
        if (!deleteUser) {
          return res.status(404).send({ status: 404, message: 'User not found' });
        }
    
        return res.status(200).send({ status: 200, user: deleteUser });
      } catch (e) {
        res.status(400).send({ status: 400, message: e.message });
    }
};
module.exports = {
    signUpUser,
    loginUser,
    updateUserById,
    deleteUserById,
};