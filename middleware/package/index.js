const jwt = require("jsonwebtoken");
const package = require("../../models/package/index")
const Exchange = require("../../models/exchange/index");
const Gathering = require("../../models/gathering/index");
const user = require("../../models/user/index");

const addNewPackage = async (req, res) => {
  try {
    const newPackage = await package.insertMany(req.body);
    return res.status(200).send({ status: 200, newPackage });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const updatePackageById = async (req, res) => {
    try {
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
    const searchedPackage = await package.findById(req.params._id);

    if (!searchedPackage) {
      return res.status(404).send({ status: 404, message: 'Package not found' });
    }
    return res.status(200).send({ status: 200, package: searchedPackage });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
}

/*
const managePackage = async (req, res) => {
  try {
    let filter = {};

  switch (req.cookies.role) {
    case 'manager_gather':
      filter = { gathering: req.cookies.workplace, role: { $ne: req.cookies.role }};
      break;
    case 'manager_exchange':
      filter = { exchange: req.cookies.workplace, role: { $ne: req.cookies.role }};
      break;
  }

  const listEmployee = await user.find(filter);

    const simplifiedList = listEmployee.map(employee => ({
      name: employee.name,
      role: employee.role,
      // variables
    }));

    return res.status(200).send({ status: 200, employee: simplifiedList });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message});
  }
};
*/

module.exports = {
    addNewPackage,
    updatePackageById,
    deletePackageById,
    getPackageById,
};
