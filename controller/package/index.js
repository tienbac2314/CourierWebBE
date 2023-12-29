const jwt = require("jsonwebtoken");
const packageMiddleware = require("../../middleware/package");
const Package = require("../../models/package/index")
const Exchange = require("../../models/exchange/index");
const Gathering = require("../../models/gathering/index");
const moment = require('moment');
const mongoose = require("mongoose");


const addNewPackage = async (req, res) => {
  try {
    
    const { name, sender, senderPhone, senderAddress, receiver, receiverPhone, receiverAddress, weight, exchange2} = req.body;

    const exchange2_place = await Exchange.findById(req.body.exchange2);

    const gathering2 = exchange2_place.gathering;

    const exchange1 = await Exchange.findById(req.cookies.workplace);

    const gathering1 = exchange1.gathering;

    // Tạo gói hàng mới với các thông tin đã lấy được
    const newPackage = await Package.create({
      name,
      sender,
      senderPhone,
      senderAddress,
      receiver,
      receiverPhone,
      receiverAddress,
      weight,
      exchange1: req.cookies.workplace,
      gathering1: gathering1,
      gathering2: gathering2,
      exchange2: exchange2,
    });

    return res.status(200).send({ status: 200, newPackage });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

const updatePackageById = async (req, res) => {
    try {
      const { _id, ...updatedData } = req.body;
  
      const updatedPackage = await Package.findByIdAndUpdate(_id, updatedData, { new: true });
  
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
        const deletePackage = await Package.deleteOne(filter);
    
        if (!deletePackage) {
          return res.status(404).send({ status: 404, message: 'Package not found' });
        }
    
        return res.status(200).send({ status: 200, package: deletePackage });
      } catch (e) {
        res.status(400).send({ status: 400, message: e.message });
      }
};

const locationFields = ['exchange1', 'gathering1', 'gathering2', 'exchange2', 'receiver'];

const getPackageById = async (req,res) =>{
  try {
    const searchedPackage = await Package.findById(req.params._id);

    if (!searchedPackage) {
      return res.status(404).send({ status: 404, message: 'Package not found' });
    }

    const exchange1 = await Exchange.findById(searchedPackage.exchange1._id);
    const gathering1 = await Gathering.findById(searchedPackage.gathering1._id);
    const gathering2 = await Gathering.findById(searchedPackage.gathering2._id);
    const exchange2 = await Exchange.findById(searchedPackage.exchange2._id);

    const packageWithOkay = {
      ...searchedPackage.toObject(),
      exchange1_name: exchange1.name,
      gathering1_name: gathering1.name,
      gathering2_name: gathering2.name,
      exchange2_name: exchange2.name,
    };

    // Construct the response object
    const response = {
      status: 200,
      package: packageWithOkay,
    };

    return res.status(200).send(response);
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
}

//thống kê tất cả kiện hàng liên quan đến 1 điểm, nếu là 'ceo' thì thống kê toàn hệ thống
const listAllPackages = async (req, res) => {
  try {
    if (req.cookies.role === 'manager_gather' || req.cookies.role === 'manager_exchange' || req.cookies.role === 'employee_exchange'){
        return await listPackagesByPoint(req, res);
    } else {
    const listPackages = await packageMiddleware.filterByTime('all', req.query, Package);
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

        const pieData = [
          { name: 'SuccessCount', quantity: successCount },
          { name: 'ShippingCount', quantity: shippingCount },
          { name: 'NoReceiveCount', quantity: noReceiveCount },
          { name: 'ReceivedCount', quantity: receiveCount },
        ];
        return res.status(200).send({
          status: 200,
          packages: listPackages, 
          pieData: pieData,
        });
  }
  } catch (error) {
    return res.status(400).send({ status: 400, message: error.message });
  }
};

//thống kê tất cả kiện hàng liên quan đến 1 điểm
const listPackagesByPoint = async (req, res) => {
  try {

    if (!req.cookies.workplace) {
      return res.status(404).send({ status: 404, message: 'no workplace found'});
    }
    const pointId = req.cookies.workplace;


    /* auth
    if (req.cookies.workplace !== pointId) {
      return res.status(405).send({ status: 405, message: 'Method not allowed' });
    }
    */

    let successCount = 0;
    let shippingCount = 0;
    let noReceiveCount = 0;
    let receivedCount = 0;

    const listPackages = await packageMiddleware.filterByTime(pointId, req.query, Package);
    const simplifiedList = listPackages.map((packages) => {
      const weight = packages.weight !== undefined ? String(packages.weight) : ''; // Convert to string or assign empty string if undefined
      const simplifiedPackage = {
        id: packages._id,
        name: packages.name,
        sendDate: moment(packages.sendDate).format('DD-MM-YYYY'),
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

//chỉ thống kê kê hàng đi đến điểm ngay sau, đến từ điểm ngay trước
const listInorOutPackagesByPoint = async (req, res) => { //đã đi và đã đến
  try {
    if (!req.cookies.workplace || req.cookies.workplace === undefined) {
      return res.status(404).send({ status: 404, message: 'no workplace found'});
    }
    const pointId = req.cookies.workplace;

    let incomingCount = 0;
    let outgoingCount = 0;

    const listPackages = await packageMiddleware.filterByTime(pointId, req.query, Package);

    const simplifiedList = listPackages.map((packages) => {
      const weight = packages.weight !== undefined ? String(packages.weight) : ''; // Convert to string or assign empty string if undefined
      const simplifiedPackage = {
        id: packages._id,
        name: packages.name,
        sendDate: moment(packages.sendDate).format('DD-MM-YYYY'),
        weight: weight,
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

// Thống kê đơn hàng cần được xác nhận chuyển đi tiếp
const listOutgoingQueuedPackages = async (req, res) => {
  try {

    if (!req.cookies.workplace) {
      return res.status(404).send({ status: 404, message: 'no workplace found'});
    }
    const pointId = req.cookies.workplace;

    /* auth
    if (req.cookies.workplace !== pointId) {
      return res.status(405).send({ status: 405, message: 'Method not allowed' });
    }
    */
    const listPackages = await packageMiddleware.filterByTime(pointId, req.query, Package);

    const simplifiedList = listPackages.map((packages) => {
      const weight = packages.weight !== undefined ? String(packages.weight) : ''; // Convert to string or assign empty string if undefined
      const simplifiedPackage = {
        id: packages._id,
        name: packages.name,
        sendDate: moment(packages.sendDate).format('DD-MM-YYYY'),
        weight: weight,
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

// Thống kê đơn hàng cần được xác nhận đã đến
const listIncomingQueuedPackages = async (req, res) => {
  try {

    if (!req.cookies.workplace) {
      return res.status(404).send({ status: 404, message: 'no workplace found'});
    }
    const pointId = req.cookies.workplace;


    /* auth
    if (req.cookies.workplace !== pointId) {
      return res.status(405).send({ status: 405, message: 'Method not allowed' });
    }
    */

    const listPackages = await packageMiddleware.filterByTime(pointId, req.query, Package);
    const simplifiedList = listPackages.map((packages) => {

      const weight = packages.weight !== undefined ? String(packages.weight) : ''; // Convert to string or assign empty string if undefined
      const simplifiedPackage = {
        id: packages._id,
        name: packages.name,
        sendDate: moment(packages.sendDate).format('DD-MM-YYYY'),
        weight: weight,
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

// Thống kê đơn hàng trong 1 năm liên quan tới 1 điểm, nếu là ceo thì lấy từ hệ thống
const listPackagesByMonth = async (req, res) => {
  try {
    const year = req.params.year;
    const role = req.cookies.role;
    const workplace = req.cookies.workplace;

    const monthlyPackageCounts = await packageMiddleware.getMonthlyPackageCounts(year, role, workplace);

    return res.status(200).send({
      status: 200,
      data: monthlyPackageCounts,
    });
  } catch (error) {
    return res.status(400).send({ status: 400, message: error.message });
  }
};

// Thống kê 5 đơn hàng mới nhất liên quan tới 1 điểm, nếu là ceo thì lấy từ toàn hệ thống
const listFiveRecentPackages = async (req, res) => {
  try {
    const role  = req.cookies.role;
    let listPackages;

    if (role === 'ceo') {
      listPackages = await Package.find().sort({ sendDate: -1 }).limit(5);
    } else if (role === 'manager_gather' || role === 'manager_exchange') {
      const pointId = req.cookies.workplace;
      listPackages = await packageMiddleware.filterByTime(pointId, req.query, Package);
    } else {
      return res.status(403).send({ status: 403, message: 'Permission denied' });
    }

    if (!listPackages.length) {
      return res.status(404).send({ status: 404, message: 'Packages not found' });
    }

    const simplifiedList = listPackages.map((packages) => {
      const weight = packages.weight !== undefined ? String(packages.weight) : ''; // Convert to string or assign empty string if undefined
      const simplifiedPackage = {
        id: packages._id,
        name: packages.name,
        sendDate: moment(packages.sendDate).format('DD-MM-YYYY'),
        weight: weight,
        status: packages.status,
      };

      return simplifiedPackage;
    });

    simplifiedList.sort((a, b) => new Date(a.sendDate) - new Date(b.sendDate));

    return res.status(200).send({ status: 200, packages: simplifiedList.slice(0, 5) });
  } catch (error) {
    return res.status(400).send({ status: 400, message: error.message });
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
    listPackagesByMonth,
    listFiveRecentPackages,
};

