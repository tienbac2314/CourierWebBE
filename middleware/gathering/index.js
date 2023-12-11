const jwt = require("jsonwebtoken");
const Gathering = require("../../models/gathering/index");
const { getManagerGather }= require ("../user");
const moment = require('moment')
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
    const searchedGathering = await Gathering.findById(req.param._id);

    if (!searchedGathering) {
      return res.status(404).send({ status: 404, message: 'Gathering not found' });
    }

    return res.status(200).send({ status: 200, gathering: searchedGathering });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

// const getAllGathering = async (req, res) => {
//   try {
//     const listGathering = await Gathering.find();
    
//     if (!listGathering) {
//       return res.status(404).send({ status: 404, message: 'Gathering not found' });
//     }
//     listGathering.forEach(async member => {
//       const res= await getManagerGather(member._id)
//       if(res == null){
//         member.managerName = "Unknown"
//       } else{
//         member.managerName = res.name;
//       }
//       console.log(member.managerName);
//     })
//     const simplifiedList = listGathering.map(gathering => ({
//       id: gathering._id,
//       name: gathering.name,
//       location: gathering.street +", "+gathering.district+", "+ gathering.city,
//       created_date: moment(gathering.created_date).format('DD-MM-YYYY'),
//       managerName: gathering.managerName,
//       // other variables
//     }));

//     return res.status(200).send({ status: 200, gathering: simplifiedList });
//   } catch (e) {
//     res.status(400).send({ status: 400, message: e.message });
//   }
// };

const getAllGathering = async (req, res) => {
  try {
    const listGathering = await Gathering.find();

    if (!listGathering || listGathering.length === 0) {
      return res.status(404).send({ status: 404, message: 'Gathering not found' });
    }

    const promises = listGathering.map(async member => {
      const res = await getManagerGather(member._id);
      if (res == null) {
        member.managerName = "Unknown";
      } else {
        member.managerName = res.name;
      }
      return member;
    });

    const updatedListGathering = await Promise.all(promises);

    const simplifiedList = updatedListGathering.map(gathering => ({
      id: gathering._id,
      name: gathering.name,
      location: `${gathering.street}, ${gathering.district}, ${gathering.city}`,
      created_date: moment(gathering.created_date).format('DD-MM-YYYY'),
      managerName: gathering.managerName,
      // other variables
    }));

    return res.status(200).send({ status: 200, gathering: simplifiedList });
  } catch (error) {
    return res.status(500).send({ status: 500, message: error });
  }
};


module.exports = {
  addNewGathering,
  updateGatheringById,
  deleteGatheringById,
  getGatheringById,
  getAllGathering,
};
