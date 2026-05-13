const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    jewelleryType: {
      type: String,
      required: true,
      enum: ['Chain / Necklace', 'Pendant', 'Ring', 'Bracelet', 'Earrings', 'Grillz', 'Other'],
    },
    vision: { type: String, required: true, maxlength: 2000 },
    budget: { type: String, default: '' },
    referenceImage: { type: String, default: '' }, // file path or URL
    status: {
      type: String,
      enum: ['New', 'Reviewed', 'Quoted', 'Accepted', 'In Progress', 'Completed', 'Rejected'],
      default: 'New',
    },
    quotedPrice: { type: Number, default: null },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomOrder', customOrderSchema);
