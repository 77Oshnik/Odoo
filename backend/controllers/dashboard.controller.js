const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Warehouse = require('../models/warehouse.model');
const Receipt = require('../models/receipt.model');
const DeliveryOrder = require('../models/deliveryOrder.model');
const InternalTransfer = require('../models/internalTransfer.model');

const getDashboardKpis = async (_req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalWarehouses,
      totalStockResult,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments(),
      Warehouse.countDocuments(),
      Product.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$totalStock', 0] } }
          }
        }
      ]),
      Receipt.countDocuments({ status: { $in: ['waiting', 'ready'] } }),
      DeliveryOrder.countDocuments({ status: { $in: ['waiting', 'ready'] } }),
      InternalTransfer.countDocuments({ status: { $in: ['waiting', 'ready'] } })
    ]);

    const productsWithRules = await Product.find({
      isActive: true,
      reorderingRule: { $ne: null }
    })
      .populate({ path: 'reorderingRule', select: 'minimumQuantity' })
      .select('totalStock reorderingRule');

    const lowStockProducts = productsWithRules.filter((product) => {
      const minimum = product.reorderingRule?.minimumQuantity ?? 0;
      const total = product.totalStock ?? 0;
      return total <= minimum;
    }).length;

    const totalStock = totalStockResult[0]?.total ?? 0;

    return res.json({
      counts: {
        totalProducts,
        activeProducts,
        totalCategories,
        totalWarehouses
      },
      inventory: {
        totalStock,
        lowStockProducts
      },
      operations: {
        pendingReceipts,
        pendingDeliveries,
        pendingTransfers
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load dashboard KPIs', error: error.message });
  }
};

const getDashboardFilters = async (_req, res) => {
  try {
    const [categories, warehouses] = await Promise.all([
      Category.find({ isActive: true }).select('name'),
      Warehouse.find({ isActive: true }).select('name')
    ]);

    return res.json({
      categories: categories.map((category) => ({ id: category._id, name: category.name })),
      warehouses: warehouses.map((warehouse) => ({ id: warehouse._id, name: warehouse.name })),
      statuses: {
        receipt: ['draft', 'waiting', 'ready', 'done', 'canceled'],
        delivery: ['draft', 'waiting', 'ready', 'done', 'canceled'],
        transfer: ['draft', 'waiting', 'ready', 'done', 'canceled']
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load dashboard filters', error: error.message });
  }
};

module.exports = {
  getDashboardKpis,
  getDashboardFilters
};
