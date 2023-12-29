const package = require("../../models/package/index")
const mongoose = require("mongoose");

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
      sendDate: {
        ...(start ? { $gte: new Date(startOfDay) } : {}),
        ...(end ? { $lte: new Date(endOfDay) } : {}),
        }
      } : {};

    let listPackages;
    if (pointId === 'all'){
      listPackages = await package.find(timeFilter).sort({ updatedAt: -1 });
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
      }).sort({ updatedAt: -1 });
  }

    return listPackages;
  } catch (error) {
    throw error;
  }
};

const getMonthlyPackageCounts = async (year, role, workplace) => {
  try {
    const isValidYearFormat = /^\d{4}$/;
    if (!isValidYearFormat.test(year)) {
      throw new Error('Invalid year format');
    }

    const aggregationPipeline = [
      {
        $match: {
          sendDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
    ];

    // Kiểm tra nếu role là 'manager_gather' hoặc 'manager_exchange' thì thêm điều kiện workplace
    if (role === 'manager_gather' || role === 'manager_exchange') {
      const workplaceConditions = [
        mongoose.Types.ObjectId(workplace), // Giá trị của workplace
      ];

      aggregationPipeline[0].$match.$or = [
        { exchange1: { $in: workplaceConditions } },
        { gathering1: { $in: workplaceConditions } },
        { gathering2: { $in: workplaceConditions } },
        { exchange2: { $in: workplaceConditions } },
      ];
    }

    aggregationPipeline.push(
      {
        $group: {
          _id: { $month: '$sendDate' },
          packageSent: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      }
    );

    const result = await package.aggregate(aggregationPipeline);

    const allMonths = Array.from({ length: 12 }, (_, index) => index + 1); // Tạo mảng từ 1 đến 12

    const monthlyPackageCounts = allMonths.map((month) => {
      const matchingResult = result.find((item) => item._id === month);
      return {
        id: month,
        month: new Date(`${year}-${month.toString().padStart(2, '0')}-01`).toLocaleString('en-US', { month: 'long' }),
        packageSent: matchingResult ? matchingResult.packageSent : 0,
      };
    });

    return monthlyPackageCounts;
  } catch (error) {
    throw error;
  }
};

module.exports = {
    filterByTime,
    getMonthlyPackageCounts,
};

