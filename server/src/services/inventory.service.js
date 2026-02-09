const inventoryItemSchema = require('../models/InventoryItem');
const inventoryMovementSchema = require('../models/InventoryMovement');
const auditLogSchema = require('../models/AuditLog');
const { MOVEMENT_TYPES } = require('../../../shared/constants');
const ApiError = require('../utils/apiError');

function getItemModel(tenantDb) {
  return tenantDb.model('InventoryItem', inventoryItemSchema);
}

function getMovementModel(tenantDb) {
  return tenantDb.model('InventoryMovement', inventoryMovementSchema);
}

function getAuditModel(tenantDb) {
  return tenantDb.model('AuditLog', auditLogSchema);
}

// ---- Inventory Items ----

async function listItems(tenantDb, options = {}) {
  const Item = getItemModel(tenantDb);
  const filter = { isActive: true };

  if (options.category) filter.category = options.category;
  if (options.search) {
    filter.name = { $regex: options.search, $options: 'i' };
  }
  if (options.lowStockOnly) {
    filter.$expr = { $lte: ['$currentStock', '$minStock'] };
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Item.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Item.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function createItem(tenantDb, data, userId) {
  const Item = getItemModel(tenantDb);
  const item = await Item.create(data);

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'inventory.create',
    targetCollection: 'inventoryItems',
    targetId: item._id,
    changes: { before: null, after: item.toJSON() },
  });

  return item.toJSON();
}

async function getItemById(tenantDb, itemId) {
  const Item = getItemModel(tenantDb);
  const item = await Item.findById(itemId).lean();

  if (!item || !item.isActive) {
    throw ApiError.notFound('Inventory item not found');
  }

  return item;
}

async function updateItem(tenantDb, itemId, updates, userId) {
  const Item = getItemModel(tenantDb);
  const item = await Item.findById(itemId);

  if (!item || !item.isActive) {
    throw ApiError.notFound('Inventory item not found');
  }

  const before = item.toJSON();
  Object.assign(item, updates);
  item._syncVersion += 1;
  await item.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'inventory.update',
    targetCollection: 'inventoryItems',
    targetId: item._id,
    changes: { before, after: item.toJSON() },
  });

  return item.toJSON();
}

// ---- Inventory Movements ----

async function recordMovement(tenantDb, itemId, movementData, userId) {
  const Item = getItemModel(tenantDb);
  const item = await Item.findById(itemId);

  if (!item || !item.isActive) {
    throw ApiError.notFound('Inventory item not found');
  }

  // Update stock
  const before = item.toJSON();
  switch (movementData.type) {
    case MOVEMENT_TYPES.IN:
      item.currentStock += movementData.quantity;
      break;
    case MOVEMENT_TYPES.OUT:
      if (item.currentStock < movementData.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock. Available: ${item.currentStock} ${item.unit}, requested: ${movementData.quantity} ${item.unit}`
        );
      }
      item.currentStock -= movementData.quantity;
      break;
    case MOVEMENT_TYPES.ADJUSTMENT:
      item.currentStock = movementData.quantity;
      break;
  }

  item._syncVersion += 1;
  await item.save();

  // Record movement
  const Movement = getMovementModel(tenantDb);
  const movement = await Movement.create({
    itemId,
    type: movementData.type,
    quantity: movementData.quantity,
    reason: movementData.reason,
    taskId: movementData.taskId || null,
    performedBy: userId,
  });

  return {
    item: item.toJSON(),
    movement: movement.toJSON(),
  };
}

async function getMovements(tenantDb, itemId, options = {}) {
  const Movement = getMovementModel(tenantDb);
  const filter = { itemId };

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Movement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Movement.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getLowStockAlerts(tenantDb) {
  const Item = getItemModel(tenantDb);
  return Item.find({
    isActive: true,
    $expr: { $lte: ['$currentStock', '$minStock'] },
  })
    .sort({ currentStock: 1 })
    .lean();
}

module.exports = {
  listItems,
  createItem,
  getItemById,
  updateItem,
  recordMovement,
  getMovements,
  getLowStockAlerts,
};
