const jwt = require("jsonwebtoken");
const package = require("../../models/package/index")


const addNewPackage = async (req, res) => {
  try {
    //if ((req.cookies.role == null) || (req.cookies.role != 'manager_gather'?)){
    //  res.status(400).send({ status: 400});
    // } else {
    const newPackage = await package.insertMany(req.body);
    return res.status(200).send({ status: 200, newPackage });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const updatePackageById = async (req, res) => {
    try {
      //if ((req.cookies.role == null) || (req.cookies.role != 'manager_gather'?)){
      //  res.status(400).send({ status: 400});
      // } else {
      const { _id, ...updatedData } = req.body;
  
      const updatedPackage = await package.findByIdAndUpdate(_id, updatedData, { new: true });
  
      if (!updatedPackage) {
        return res.status(404).send({ status: 404, message: 'Package not found' });
      }
  
      return res.status(200).send({ status: 200, package: updatedPackage });
    } catch (e) {
      res.status(400).send({ status: 400, message: e.message });
    }
};

const deletePackageById =async (req,res) => {
    try {
        //if ((req.cookies.role == null) || (req.cookies.role != 'manager_gather'?)){
        //  res.status(400).send({ status: 400});
        // } else {
        const filter = { _id: req.body._id };
        const deletePackage = await package.deleteOne(filter);
    
        if (!deletePackage) {
          return res.status(404).send({ status: 404, message: 'Package not found' });
        }
    
        return res.status(200).send({ status: 200, package: deletePackage });
      } catch (e) {
        res.status(400).send({ status: 400, message: e.message });
      }
};

const getPackageById = async (req,res) =>{
  try {
    // const filter = { _id: req.body._id };
    const searchedPackage = await package.findById(req.body._id);

    if (!searchedPackage) {
      return res.status(404).send({ status: 404, message: 'Package not found' });
    }

    return res.status(200).send({ status: 200, package: searchedPackage });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
}
module.exports = {
    addNewPackage,
    updatePackageById,
    deletePackageById,
    getPackageById,
};
