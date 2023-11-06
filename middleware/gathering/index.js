const jwt = require("jsonwebtoken");
const Gathering = require("../../models/gathering/index");

const addNewGathering = async (req, res) => {
  try {
    const newGathering = await Gathering.insertMany(req.body);
    return res.status(200).send({ status: 200, newGathering });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const updateGatheringById = async (req, res) => {
  try {
    const { _id, ...updatedData } = req.body;

    const updatedGathering = await Gathering.findByIdAndUpdate(_id, updatedData, { new: true });

    if (!updatedGathering) {
      return res.status(404).send({ status: 404, message: 'Gathering not found' });
    }

    return res.status(200).send({ status: 200, gathering: updatedGathering });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const deleteGatheringById = async (req, res) => {
  try {
    const filter = { _id: req.body._id };
    const deleteGathering = await Gathering.deleteOne(filter);

    if (!deleteGathering) {
      return res.status(404).send({ status: 404, message: 'Gathering not found' });
    }

    return res.status(200).send({ status: 200, gathering: deleteGathering });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const getGatheringById = async (req, res) => {
  try {
    const searchedGathering = await Gathering.findById(req.body._id);

    if (!searchedGathering) {
      return res.status(404).send({ status: 404, message: 'Gathering not found' });
    }

    return res.status(200).send({ status: 200, gathering: searchedGathering });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

module.exports = {
  addNewGathering,
  updateGatheringById,
  deleteGatheringById,
  getGatheringById,
};
