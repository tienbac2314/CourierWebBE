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

const listPackagesByPoint = async (req, res) => {
  try {
    const pointId = req.params.pointId;

    /* auth
    if (req.cookies.workplace !== pointId) {
      return res.status(405).send({ status: 405, message: 'Method not allowed' });
    }
    */

    // Tìm tất cả các gói hàng có liên quan đến điểm chỉ định với cả 2 trạng thái "success" và "shipping" hoặc "no-receive" ở điểm cuối
    const listPackages = await package.find({
      $or: [
        { exchange1: pointId},
        { gathering1: pointId},
        { gathering2: pointId},
        { exchange2: pointId}
      ]
    });

    if (!listPackages.length) {
      return res.status(404).send({ status: 404, message: 'Packages not found' });
    }

    let successCount = 0;
    let shippingCount = 0;
    let noReceiveCount = 0;

    const simplifiedList = listPackages.map((packages) => {
      const simplifiedPackage = {
        name: packages.name,
        status: packages.status,
        location: '',
      };

      // tìm điểm hiện tại
      const locationFields = ['exchange1', 'gathering1', 'gathering2', 'exchange2'];

      for (const field of locationFields) {
        if (packages[field]?._id.toString() === pointId.toString()) {
          simplifiedPackage.location = field;
          break;
        }
      }

      // đảm bảo status về shipping khi dùng ở điểm sau, đảm bảo tất cả điểm đã qua hiện success
      if (packages.status === 'shipping') {
        if (packages.nextStep === 'exchange2' && packages.gathering2._id === pointId) {
          simplifiedPackage.status = 'success';
        } else if (packages.nextStep !== ('gathering1') && packages.gathering1._id === pointId) {
          simplifiedPackage.status = 'success';
        } else if (packages.exchange1._id == pointId) {
          simplifiedPackage.status = 'success';
        } else {
          simplifiedPackage.status = 'shipping';
        }
      } else if ((packages.location !== packages.nextStep) && (locationFields.indexOf(packages.nextStep) <= locationFields.indexOf(packages.location))) {
        simplifiedPackage.status = 'shipping';
      } else {
        simplifiedPackage.status = packages.status;
      }

      // đếm lượng hàng cùng các status
      switch (simplifiedPackage.status) {
        case 'success':
          successCount++;
          break;
        case 'shipping':
          shippingCount++;
          break;
        case 'no-receive':
          noReceiveCount++;
          break;
      }
      
      return simplifiedPackage;
    });

    const summary = {
      successCount,
      shippingCount,
      noReceiveCount,
    };
    const pieData = Object.entries(summary).map(([name, quantity]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalizing the first letter of the property name
      quantity,
    }));
    return res.status(200).send({ status: 200, packages: simplifiedList, pieData});
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
};


module.exports = {
    addNewPackage,
    updatePackageById,
    deletePackageById,
    getPackageById,
    listPackagesByPoint,
};
