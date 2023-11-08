const jwt = require("jsonwebtoken");
const Exchange = require("../../models/exchange/index");
const { user } = require("../../models");

const addNewExchange = async (req, res) => {
  try {
    if ((req.cookies.role == null) || (req.cookies.role != 'manager_exchange')){
      res.status(400).send({ status: 400});
    } else {
    const newExchange = await Exchange.insertMany(req.body);
    return res.status(200).send({ status: 200, newExchange });
  }
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const updateExchangeById = async (req, res) => {
  try {
    if ((req.cookies.role == null) || (req.cookies.role != 'manager_exchange')){
      res.status(400).send({ status: 400});
    } else {
    const { _id, ...updatedData } = req.body;
    const updatedExchange = await Exchange.findByIdAndUpdate(_id, updatedData, { new: true });

    if (!updatedExchange) {
      return res.status(404).send({ status: 404, message: 'Exchange not found' });
    }

    return res.status(200).send({ status: 200, exchange: updatedExchange });
  }
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const deleteExchangeById = async (req, res) => {
  try {
    if ((req.cookies.role == null) || (req.cookies.role != 'manager_exchange')){
      res.status(400).send({ status: 400});
    } else {
    const filter = { _id: req.body._id };
    const deleteExchange = await Exchange.deleteOne(filter);

    if (!deleteExchange) {
      return res.status(404).send({ status: 404, message: 'Exchange not found' });
    }

    return res.status(200).send({ status: 200, exchange: deleteExchange });
  }
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const getExchangeById = async (req, res) => {
  try {
    const searchedExchange = await Exchange.findById(req.body._id);

    if (!searchedExchange) {
      return res.status(404).send({ status: 404, message: 'Exchange not found' });
    }

    return res.status(200).send({ status: 200, exchange: searchedExchange });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

module.exports = {
  addNewExchange,
  updateExchangeById,
  deleteExchangeById,
  getExchangeById,
};
