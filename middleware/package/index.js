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

const locationFields = ['exchange1', 'gathering1', 'gathering2', 'exchange2'];

// hàm định dạng filter thời gian
const filterByTime = async (pointId, query, packageModel) => {
  try {
    const { start, end } = query;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    const isValidYearFormat = /^\d{4}$/;
    const isValidMonthFormat = /^\d{4}-\d{2}$/;

    let startOfDay = startDate;
    let endOfDay = endDate;

    if (endDate){
      if (isValidYearFormat.test(end)) {
        endOfDay = new Date(`${end}-12-31`);
      } else if (isValidMonthFormat.test(end)){
        const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
        endOfDay = new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth(), lastDayOfMonth.getDate(), 23, 59, 59, 999);
      }
      endOfDay.setHours(23, 59, 59, 999);
    }

    const timeFilter = (start || end) ? {
      createdAt: {
        ...(start ? { $gte: new Date(startOfDay) } : {}),
        ...(end ? { $lte: new Date(endOfDay) } : {}),
        }
      } : {};

    let listPackages;
    if (pointId === 'all'){
      listPackages = await package.find(timeFilter);
    } else {
      listPackages = await package.find({
        $and: [
          {
            $or: [
              { exchange1: pointId },
              { gathering1: pointId },
              { gathering2: pointId },
              { exchange2: pointId },
            ],
          },
          timeFilter,
        ],
      });
  }

    return listPackages;
  } catch (error) {
    throw error;
  }
};

const getPackageById = async (req,res) =>{
  try {
    const searchedPackage = await package.findById(req.params._id);

    if (!searchedPackage) {
      return res.status(404).send({ status: 404, message: 'Package not found' });
    }
    return res.status(200).send({ status: 200, package: searchedPackage});
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
}

const listAllPackages = async (req, res) => {
  try {
    const listPackages = await filterByTime('all', req.query, package);
    if (!listPackages.length) {
      return res.status(404).send({ status: 404, message: 'Packages not found' });
    }
    
        let shippingCount = 0;
        let successCount = 0;
        let receiveCount = 0;
        let noReceiveCount = 0;
    
        listPackages.forEach((packages) => {
          switch (packages.status) {
            case 'shipping':
              shippingCount++;
              break;
            case 'success':
              successCount++;
              break;
            case 'received':
              receiveCount++;
              break;
            case 'no-receive':
              noReceiveCount++;
              break;
            default:
              break;
          }
        });
        return res.status(200).send({
          status: 200,
          packages: listPackages, 
          counts: {
            shipping: shippingCount,
            success: successCount,
            received: receiveCount,
            'no-receive': noReceiveCount,
          },
        });
  } catch (error) {
    return res.status(400).send({ status: 400, message: error.message });
  }
};

const listPackagesByPoint = async (req, res) => {
  try {

    const pointId = req.params.pointId;
    const { startDate, endDate } = req.query;

    /* auth
    if (req.cookies.workplace !== pointId) {
      return res.status(405).send({ status: 405, message: 'Method not allowed' });
    }
    */

    // Thêm điều kiện filter sendDate theo khoảng thời gian nếu startDate hoặc endDate tồn tại
    const timeFilter = (startDate || endDate) ? {
    sendDate: {
      ...(startDate ? { $gte: new Date(startDate) } : {}),
      ...(endDate ? { $lte: new Date(endDate) } : {}),
      }
    } : {};

    // Tìm tất cả các gói hàng có liên quan đến điểm chỉ định với cả 2 trạng thái "success" và "shipping" hoặc "no-receive" ở điểm cuối
    const listPackages = await package.find({
      $and: [
        {
          $or: [
            { exchange1: pointId },
            { gathering1: pointId },
            { gathering2: pointId },
            { exchange2: pointId }
          ]
        },
        timeFilter // Thêm điều kiện filter theo khoảng thời gian
      ]
    });

    if (!listPackages.length) {
      return res.status(404).send({ status: 404, message: 'Packages not found' });
    }

    let successCount = 0;
    let shippingCount = 0;
    let noReceiveCount = 0;
    let receivedCount = 0;

    const simplifiedList = listPackages.map((packages) => {
      const simplifiedPackage = {
        name: packages.name,
        status: packages.status,
        location: '',
      };

      // tìm điểm hiện tại
      for (const field of locationFields) {
        if (packages[field]?._id.toString() === pointId.toString()) {
          simplifiedPackage.location = field;
          break;
        }
      }

      // đảm bảo status về shipping khi dùng ở điểm sau, đảm bảo tất cả điểm đã qua hiện success
      if (packages.status === 'shipping') {
        if (locationFields.indexOf(packages.nextStep) > locationFields.indexOf(packages.currentLocation)) {
          simplifiedPackage.status = 'shipping';
        } else {
          simplifiedPackage.status = 'success';
        }
      } else if (locationFields.indexOf(packages.nextStep) < locationFields.indexOf(packages.currentLocation)) {
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
        case 'received':
          receivedCount++;
          break;
      }
      
      return simplifiedPackage;
    });

    const summary = {
      successCount,
      shippingCount,
      noReceiveCount,
      receivedCount,
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

//chỉ liệt kê hàng đi từ điểm ngay trước, đến từ điểm ngay sau
const listInorOutPackagesByPoint = async (req, res) => {
  try {
    const pointId = req.params.pointId;

    /*
    if (req.cookies.workplace !== pointId) {
      return res.status(405).send({ status: 405, message: 'Method not allowed' });
    }
    */

    const { startDate, endDate } = req.query;

    let incomingCount = 0;
    let outgoingCount = 0;

    // Thêm điều kiện filter sendDate theo khoảng thời gian nếu startDate hoặc endDate tồn tại
    const timeFilter = (startDate || endDate) ? {
    sendDate: {
      ...(startDate ? { $gte: new Date(startDate) } : {}),
      ...(endDate ? { $lte: new Date(endDate) } : {}),
      }
    } : {};

    // Tìm tất cả các gói hàng có liên quan đến điểm chỉ định với cả 2 trạng thái "success" và "shipping" hoặc "no-receive" ở điểm cuối
    const listPackages = await package.find({
      $and: [
        {
          $or: [
            { exchange1: pointId },
            { gathering1: pointId },
            { gathering2: pointId },
            { exchange2: pointId }
          ]
        },
        timeFilter // Thêm điều kiện filter theo khoảng thời gian
      ]
    });

    if (!listPackages.length) {
      return res.status(404).send({ status: 404, message: 'Packages not found' });
    }

    const simplifiedList = listPackages.map((packages) => {
      const simplifiedPackage = {
        name: packages.name,
        status: packages.status,
        location: '',
        nextstep: packages.nextStep,
      };

      for (const field of locationFields) {
        if (packages[field]?._id.toString() === pointId.toString()) {
          simplifiedPackage.location = field;
          break;
        }
      }

      // đảm bảo status về shipping khi dùng ở điểm sau, đảm bảo tất cả điểm đã qua hiện success
      if (packages.status === 'shipping') {
        if (locationFields.indexOf(packages.nextStep) > locationFields.indexOf(packages.location)) {
          simplifiedPackage.status = 'shipping';
        } else {
          simplifiedPackage.status = 'success';
        }
      } else if (locationFields.indexOf(packages.nextStep) < locationFields.indexOf(packages.location)) {
        simplifiedPackage.status = 'shipping';
      } else {
        simplifiedPackage.status = packages.status;
      }

      if (locationFields.indexOf(packages.nextStep) - locationFields.indexOf(simplifiedPackage.location) === 1){
            if (!((packages.location === 'gathering1') && (packages.gathering1 === packages.gathering2))){
              outgoingCount++;
              simplifiedPackage.out = 1;
            }
          }
      if ((locationFields.indexOf(packages.nextStep) - locationFields.indexOf(simplifiedPackage.location) === 0)){
            if (!((packages.location === 'gathering2') && (packages.gathering1 === packages.gathering2))){
              incomingCount++;
              simplifiedPackage.in = 1;
            }
          }
      
      return simplifiedPackage;
    });
    
    const outgoingList = simplifiedList.filter((packages) => {
      return packages.out === 1;
    })

    const incomingList = simplifiedList.filter((packages) => {
      return packages.in === 1;
    })

    return res.status(200).send({ status: 200, outgoing_packages: outgoingList, incoming_packages: incomingList, outgoingCount, incomingCount});
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
};

const listOutgoingQueuedPackages = async (req, res) => {
  try {

    const pointId = req.params.pointId;
    const { startDate, endDate } = req.query;

    /* auth
    if (req.cookies.workplace !== pointId) {
      return res.status(405).send({ status: 405, message: 'Method not allowed' });
    }
    */

    // Thêm điều kiện filter sendDate theo khoảng thời gian nếu startDate hoặc endDate tồn tại
    const timeFilter = (startDate || endDate) ? {
    sendDate: {
      ...(startDate ? { $gte: new Date(startDate) } : {}),
      ...(endDate ? { $lte: new Date(endDate) } : {}),
      }
    } : {};

    // Tìm tất cả các gói hàng có liên quan đến điểm chỉ định với cả 2 trạng thái "success" và "shipping" hoặc "no-receive" ở điểm cuối
    const listPackages = await package.find({
      $and: [
        {
          $or: [
            { exchange1: pointId },
            { gathering1: pointId },
            { gathering2: pointId },
            { exchange2: pointId }
          ]
        },
        timeFilter // Thêm điều kiện filter theo khoảng thời gian
      ]
    });

    if (!listPackages.length) {
      return res.status(404).send({ status: 404, message: 'Packages not found' });
    }

    const simplifiedList = listPackages.map((packages) => {
      const simplifiedPackage = {
        name: packages.name,
        status: packages.status,
        location: '',
        nextstep: packages.nextStep,
      };

      for (const field of locationFields) {
        if (packages[field]?._id.toString() === pointId.toString()) {
          simplifiedPackage.location = field;
          break;
        }
      }

      if (!((packages.status === 'success') && (locationFields.indexOf(packages.nextStep) === locationFields.indexOf(simplifiedPackage.location)))) {
        simplifiedPackage.queued = 0;
      }

      return simplifiedPackage;
    });

    const filteredList = simplifiedList.filter((packages) => {
      return packages.queued === undefined;
    });

    return res.status(200).send({ status: 200, OutgoingQueuedPackages: filteredList});
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
    
};

const listIncomingQueuedPackages = async (req, res) => {
  try {

    const pointId = req.params.pointId;
    const { startDate, endDate } = req.query;

    /* auth
    if (req.cookies.workplace !== pointId) {
      return res.status(405).send({ status: 405, message: 'Method not allowed' });
    }
    */

    // Thêm điều kiện filter sendDate theo khoảng thời gian nếu startDate hoặc endDate tồn tại
    const timeFilter = (startDate || endDate) ? {
    sendDate: {
      ...(startDate ? { $gte: new Date(startDate) } : {}),
      ...(endDate ? { $lte: new Date(endDate) } : {}),
      }
    } : {};

    // Tìm tất cả các gói hàng có liên quan đến điểm chỉ định với cả 2 trạng thái "success" và "shipping" hoặc "no-receive" ở điểm cuối
    const listPackages = await package.find({
      $and: [
        {
          $or: [
            { exchange1: pointId },
            { gathering1: pointId },
            { gathering2: pointId },
            { exchange2: pointId }
          ]
        },
        timeFilter // Thêm điều kiện filter theo khoảng thời gian
      ]
    });

    if (!listPackages.length) {
      return res.status(404).send({ status: 404, message: 'Packages not found' });
    }

    const simplifiedList = listPackages.map((packages) => {
      const simplifiedPackage = {
        name: packages.name,
        status: packages.status,
        location: '',
        nextstep: packages.nextStep,
      };

      for (const field of locationFields) {
        if (packages[field]?._id.toString() === pointId.toString()) {
          simplifiedPackage.location = field;
          break;
        }
      }

      if (!((packages.status === 'shipping') && (locationFields.indexOf(packages.nextStep) === locationFields.indexOf(simplifiedPackage.location)))) {
        simplifiedPackage.queued = 0;
      }

      return simplifiedPackage;
    });

    const filteredList = simplifiedList.filter((packages) => {
      return packages.queued === undefined;
    });

    return res.status(200).send({ status: 200, IncomingQueuedPackages: filteredList});
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
    
};

module.exports = {
    addNewPackage,
    updatePackageById,
    deletePackageById,
    getPackageById,
    listAllPackages,
    listPackagesByPoint,
    listInorOutPackagesByPoint,
    listOutgoingQueuedPackages,
    listIncomingQueuedPackages,
};

