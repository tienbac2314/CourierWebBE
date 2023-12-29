const Exchange = require("../../models/exchange/index");
const mongoose = require("mongoose");

const updateExchangeManager = async (exchangeId, managerId) => {
  try {
    const updatedExchange = await Exchange.findByIdAndUpdate(exchangeId, { manager: managerId });

    if (!updatedExchange) {
      console.error('Exchange not found');
    }
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  updateExchangeManager,
};