const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
const { uploadBufferToCloudinary, deleteCloudinaryAsset } = require('../utils/cloudinary');

exports.getProducts = async (req, res) => {
  try {
    const { type, search, sort, page = 1, limit = 12, featured } = req.query;
    const query = { isActive: true };
    if (type && type !== 'All') query.type = type;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    const sortMap = { newest:{createdAt:-1}, oldest:{createdAt:1}, 'price-low':{price:1}, 'price-high':{price:-1}, popular:{sold:-1} };
    const sortBy = sortMap[sort] || { createdAt: -1 };
    const skip = (Number(page)-1)*Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortBy).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ success:true, products, pagination:{ page:Number(page), limit:Number(limit), total, pages:Math.ceil(total/Number(limit)) } });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

exports.getProduct = async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const product = await Product.findOne({
      ...(isObjectId ? { _id:req.params.id } : { slug:req.params.id }),
      isActive: true,
    });
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, product });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

const parseBody = (body) => {
  const b = { ...body };
  if (typeof b.sizes === 'string') b.sizes = b.sizes ? b.sizes.split(',').map(s=>s.trim()) : [];
  if (typeof b.availableMaterials === 'string') {
    try { b.availableMaterials = JSON.parse(b.availableMaterials); }
    catch { b.availableMaterials = b.availableMaterials.split(',').map(s=>s.trim()); }
  }
  if (typeof b.diamond === 'string') { try { b.diamond = JSON.parse(b.diamond); } catch {} }
  if (b.price) b.price = Number(b.price);
  if (b.comparePrice) b.comparePrice = Number(b.comparePrice) || null;
  if (b.stock) b.stock = Number(b.stock);
  if (b.isFeatured !== undefined) b.isFeatured = b.isFeatured === 'true' || b.isFeatured === true;
  return b;
};

const uploadProductImages = async (files = []) => {
  if (!files.length) return [];
  const uploads = await Promise.all(
    files.map(file => uploadBufferToCloudinary(file.buffer, 'wyw/products'))
  );
  return uploads.map(upload => upload.secure_url);
};

const safeDecode = (value) => {
  try { return decodeURIComponent(value); }
  catch { return value; }
};

exports.createProduct = async (req, res) => {
  try {
    const body = parseBody(req.body);
    const uploadedImages = await uploadProductImages(req.files);
    if (uploadedImages.length) body.images = uploadedImages;
    const product = await Product.create(body);
    res.status(201).json({ success:true, product });
  } catch(err){ res.status(400).json({ success:false, message:err.message }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const body = parseBody(req.body);
    const uploadedImages = await uploadProductImages(req.files);
    if (uploadedImages.length) {
      const existing = await Product.findById(req.params.id);
      body.images = [...(existing?.images||[]), ...uploadedImages];
    }
    const product = await Product.findByIdAndUpdate(req.params.id, body, { new:true, runValidators:true });
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, product });
  } catch(err){ res.status(400).json({ success:false, message:err.message }); }
};

exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    const image = safeDecode(req.params.filename);
    product.images = product.images.filter(img => img !== image);
    await product.save();
    if (image.startsWith('http')) {
      await deleteCloudinaryAsset(image);
    } else {
      const filePath = path.join(__dirname,'..','uploads',image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success:true, product });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.json({ success:true, product, message: product.isFeatured ? 'Added to homepage' : 'Removed from homepage' });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive:false });
    res.json({ success:true, message:'Product deactivated' });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    if (product.reviews.find(r => r.user?.toString() === req.user.id))
      return res.status(400).json({ success:false, message:'Already reviewed' });
    product.reviews.push({ user:req.user.id, name:req.user.name, rating, comment });
    product.updateRatings();
    await product.save();
    res.status(201).json({ success:true, product });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};
