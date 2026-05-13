const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage, addReview, toggleFeatured } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, upload.array('images', 6), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 6), updateProduct);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);
router.delete('/:id/image/:filename', protect, adminOnly, deleteProductImage);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
