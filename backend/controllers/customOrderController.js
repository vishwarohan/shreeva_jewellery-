const CustomOrder = require('../models/CustomOrder');

// @desc  Submit custom order request
// @route POST /api/custom
exports.submitCustomOrder = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, jewelleryType, vision, budget } = req.body;
    if (!firstName || !email || !phone || !jewelleryType || !vision) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }
    const order = await CustomOrder.create({ firstName, lastName, email, phone, jewelleryType, vision, budget });
    res.status(201).json({ success: true, message: 'Custom order request submitted! We\'ll get back to you within 48 hours.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all custom orders (admin)
// @route GET /api/custom
exports.getCustomOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const orders = await CustomOrder.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update custom order status (admin)
// @route PUT /api/custom/:id
exports.updateCustomOrder = async (req, res) => {
  try {
    const order = await CustomOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Custom order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
