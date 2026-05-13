const mongoose = require('mongoose');

const MATERIALS = [
  '10K Gold','14K Gold','18K Gold','24K Gold',
  'White Gold','Rose Gold','Gold Plated',
  'Silver','Silver Plated','Platinum',
  'Stainless Steel','Custom',
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, lowercase: true },
    type: { type: String, required: true, enum: ['Chain','Pendant','Ring','Bracelet','Earring','Grillz','Other'] },
    description: { type: String, required: [true, 'Description is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    comparePrice: { type: Number, default: null },

    // Images are Cloudinary URLs. Older local filenames still render via /uploads/.
    images: [{ type: String }],
    badge: { type: String, default: null },

    // Material — default + all user-selectable options
    material: { type: String, enum: MATERIALS, default: 'Gold Plated' },
    availableMaterials: [{ type: String, enum: MATERIALS }],

    // Diamond 4Cs
    diamond: {
      cut:         { type: String, enum: ['Excellent','Very Good','Good','Fair','Poor','N/A'], default: 'N/A' },
      clarity:     { type: String, enum: ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3','N/A'], default: 'N/A' },
      color:       { type: String, enum: ['D','E','F','G','H','I','J','K','L','M','N/A'], default: 'N/A' },
      caratWeight: { type: String, default: '' },
      stoneType:   { type: String, enum: ['Natural Diamond','Lab Diamond','CZ','Moissanite','Ruby','Sapphire','Emerald','Other','N/A'], default: 'CZ' },
    },

    sizes: [{ type: String }],
    stock: { type: Number, default: 0 },
    sold:  { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    reviews: [{
      user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name:    String,
      rating:  { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-') + '-' + Date.now().toString(36);
  }
  next();
});

productSchema.methods.updateRatings = function () {
  const r = this.reviews;
  this.ratings = r.length === 0
    ? { average: 0, count: 0 }
    : { average: Math.round((r.reduce((s, x) => s + x.rating, 0) / r.length) * 10) / 10, count: r.length };
};

module.exports = mongoose.model('Product', productSchema);
