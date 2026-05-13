const express = require('express');
const router = express.Router();
const { submitCustomOrder, getCustomOrders, updateCustomOrder } = require('../controllers/customOrderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', submitCustomOrder);
router.get('/', protect, adminOnly, getCustomOrders);
router.put('/:id', protect, adminOnly, updateCustomOrder);

module.exports = router;
