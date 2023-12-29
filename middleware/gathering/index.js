const Gathering = require("../../models/gathering/index");
const mongoose = require("mongoose");

const updateGatheringManager = async (gatheringId, managerId) => {
  try {
    const updatedGathering = await Gathering.findByIdAndUpdate(gatheringId, { manager: managerId }, { new: true });

    if (!updatedGathering) {
      console.error('Gathering not found');
    }
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  updateGatheringManager,
};