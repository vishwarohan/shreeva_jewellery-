const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc  Create order
// @route POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Calculate totals & verify stock
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
        size: item.size || '',
      });
    }

    const shippingCost = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shippingCost;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      subtotal,
      shippingCost,
      total,
      notes: notes || '',
    });

    // Decrement stock & increment sold
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Clear user cart
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get my orders
// @route GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single order
// @route GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images type');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all orders (admin)
// @route GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('user', 'name email'),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update order status (admin)
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const update = { orderStatus };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (orderStatus === 'Delivered') update.deliveredAt = Date.now();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
