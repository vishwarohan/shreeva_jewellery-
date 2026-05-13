const User = require('../models/User');
const Product = require('../models/Product');

// @desc  Get cart
// @route GET /api/cart
exports.getCart = async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product');
  res.json({ success: true, cart: user.cart });
};

// @desc  Add to cart
// @route POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const user = await User.findById(req.user.id);
    const existing = user.cart.find(i => i.product.toString() === productId && i.size === size);

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity, size: size || '' });
    }

    await user.save();
    await user.populate('cart.product');
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update cart item quantity
// @route PUT /api/cart/:itemId
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user.id);
    const item = user.cart.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    await user.save();
    await user.populate('cart.product');
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Remove cart item
// @route DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(i => i._id.toString() !== req.params.itemId);
    await user.save();
    await user.populate('cart.product');
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle wishlist
// @route POST /api/cart/wishlist/:productId
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const idx = user.wishlist.indexOf(req.params.productId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(req.params.productId);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
