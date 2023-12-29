const jwt = require("jsonwebtoken");
const Exchange = require("../../models/exchange/index");
const Gathering = require("../../models/gathering/index");
const User = require("../../models/user/index");
const userMiddleware = require("../../middleware/user");
const moment = require('moment')
const { getManagerExchange }= require ("../user");


const addNewExchange = async (req, res) => {
  try {
    const { managerId, ...updatedData} = req.body;

    const newExchange = await Exchange.insertMany(req.body);
    const newManager = await User.findByIdAndUpdate(
      managerId,
      {
        $set: {
          role: 'manager_gather',
          exchange: newExchange._id,
        },
        $unset: {
          gathering: 1,
        },
      },
      { new: true }
    );
    
    return res.status(200).send({ status: 200, newExchange });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const updateExchangeById = async (req, res) => {
  try {
    const { _id, manager, ...updatedData } = req.body;
    if (manager) {
      userMiddleware.updateWorkplace("exchange", _id, manager);
    }
    const updatedExchange = await Exchange.findByIdAndUpdate(_id, updatedData, { new: true });

    if (!updatedExchange) {
      return res.status(404).send({ status: 404, message: 'Exchange not found' });
    }

    return res.status(200).send({ status: 200, exchange: updatedExchange });

  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const deleteExchangeById = async (req, res) => {
  try {
    
    const filter = { _id: req.body._id };
    const deleteExchange = await Exchange.deleteOne(filter);

    if (!deleteExchange) {
      return res.status(404).send({ status: 404, message: 'Exchange not found' });
    }

    return res.status(200).send({ status: 200, exchange: deleteExchange });

  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const getExchangeById = async (req, res) => {
  try {
    const searchedExchange = await Exchange.findById(req.params._id);

    if (!searchedExchange) {
      return res.status(404).send({ status: 404, message: 'Exchange not found' });
    }

    return res.status(200).send({ status: 200, exchange: searchedExchange });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

// Thống kê toàn bộ các điểm giao dịch
const getAllExchange = async (req, res) => {
  try {
    const listExchange = await Exchange.find();

    if (!listExchange) {
      return res.status(404).send({ status: 404, message: 'Exchange not found' });
    }

    const simplifiedList = listExchange.map(exchange => ({
      id: exchange._id,
      name: exchange.name,
      location: `${exchange.street}, ${exchange.district}, ${exchange.city}`,
    }));

    return res.status(200).send({ status: 200, exchanges: simplifiedList });
  } catch (error) {
    return res.status(400).send({ status: 400, message: error });
  }
};

// Thông kê các điểm giao dịch trong 1 điểm tập kết
const getExchangeByGather = async (req, res) => {
  try {
    const currentGathering = await Gathering.findById(req.params._id);

    if (!currentGathering) {
      return res.status(404).send({ status: 404, message: req.params._id });
    }

    const listGathering = await Exchange.find({ gathering: currentGathering._id });

    const promises = listGathering.map(async member => {
      const res = await getManagerExchange(member._id);
      if (res == null) {
        member.managerName = "Unknown";
      } else {
        member.managerName = res.name;
      }
      return member;
    });

    const updatedListGathering = await Promise.all(promises);

    const simplifiedList = updatedListGathering.map(exchange => ({
      id: exchange._id,
      name: exchange.name,
      location: `${exchange.street}, ${exchange.district}, ${exchange.city}`,
      created_date: moment(exchange.created_date).format('DD-MM-YYYY'),
      managerName: exchange.managerName,
      // variables
    }));

    return res.status(200).send({ status: 200, gathering: simplifiedList });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

module.exports = {
  addNewExchange,
  updateExchangeById,
  deleteExchangeById,
  getAllExchange,
  getExchangeById,
  getExchangeByGather,
};
