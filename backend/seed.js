require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  {
    name: 'Iced Out Cuban Chain 20"',
    type: 'Chain',
    description: 'Our signature Cuban link chain, fully iced out with premium CZ stones. Heavy, bold, and made to turn heads. Each link is hand-set for maximum sparkle.',
    price: 4999, comparePrice: 6499, badge: 'Bestseller',
    material: 'Gold Plated',
    availableMaterials: ['Gold Plated', '14K Gold', '18K Gold', 'Silver Plated'],
    diamond: { stoneType: 'CZ', caratWeight: '18 ct total', cut: 'Excellent', color: 'D', clarity: 'VVS1' },
    sizes: ['18"', '20"', '22"', '24"'],
    stock: 50, sold: 230, isFeatured: true, isActive: true, images: [],
  },
  {
    name: 'WYW Logo Diamond Pendant',
    type: 'Pendant',
    description: 'Our iconic WYW logo pendant, hand-set with premium CZ diamonds. Bold statement piece. Comes with an 18" chain.',
    price: 7499, comparePrice: 9999, badge: null,
    material: '14K Gold',
    availableMaterials: ['Gold Plated', '14K Gold', '18K Gold', 'White Gold'],
    diamond: { stoneType: 'CZ', caratWeight: '5 ct total', cut: 'Very Good', color: 'E', clarity: 'VS1' },
    sizes: [],
    stock: 30, sold: 120, isFeatured: true, isActive: true, images: [],
  },
  {
    name: 'Iced Tennis Bracelet 8"',
    type: 'Bracelet',
    description: 'Classic tennis bracelet fully iced with round-cut CZ stones. Flexible and comfortable for all-day wear. Available in multiple lengths.',
    price: 3599, comparePrice: 4999, badge: 'New',
    material: 'Silver Plated',
    availableMaterials: ['Gold Plated', 'Silver Plated', '14K Gold', 'Rose Gold'],
    diamond: { stoneType: 'CZ', caratWeight: '10 ct total', cut: 'Excellent', color: 'F', clarity: 'VS2' },
    sizes: ['7"', '8"', '9"'],
    stock: 45, sold: 89, isFeatured: true, isActive: true, images: [],
  },
  {
    name: 'Diamond Cluster Pinky Ring',
    type: 'Ring',
    description: 'Statement pinky ring with a cluster of premium CZ diamonds set in a prong setting. Available in sizes 7-11.',
    price: 2999, comparePrice: 3999, badge: null,
    material: 'Gold Plated',
    availableMaterials: ['Gold Plated', '10K Gold', '14K Gold', 'White Gold', 'Rose Gold'],
    diamond: { stoneType: 'CZ', caratWeight: '3 ct total', cut: 'Very Good', color: 'G', clarity: 'SI1' },
    sizes: ['7', '8', '9', '10', '11'],
    stock: 60, sold: 67, isFeatured: false, isActive: true, images: [],
  },
  {
    name: 'Hip Hop Stud Earrings',
    type: 'Earring',
    description: 'Bold square-cut CZ stud earrings. Push-back closure. Available in gold and silver. Perfect everyday bling.',
    price: 1499, comparePrice: null, badge: 'New',
    material: 'Gold Plated',
    availableMaterials: ['Gold Plated', 'Silver Plated', '14K Gold'],
    diamond: { stoneType: 'CZ', caratWeight: '2 ct each', cut: 'Good', color: 'H', clarity: 'SI2' },
    sizes: [],
    stock: 80, sold: 44, isFeatured: false, isActive: true, images: [],
  },
  {
    name: 'Rope Chain Necklace 24"',
    type: 'Chain',
    description: 'Thick rope chain with a twisted link pattern. A hip-hop classic. Heavy gauge, durable, and timeless.',
    price: 3299, comparePrice: 4299, badge: null,
    material: 'Gold Plated',
    availableMaterials: ['Gold Plated', '14K Gold', '18K Gold', 'Silver Plated', 'Stainless Steel'],
    diamond: { stoneType: 'N/A', caratWeight: '', cut: 'N/A', color: 'N/A', clarity: 'N/A' },
    sizes: ['20"', '22"', '24"', '26"'],
    stock: 35, sold: 102, isFeatured: false, isActive: true, images: [],
  },
  {
    name: 'Custom Gold Grillz',
    type: 'Grillz',
    description: 'Custom-fitted grillz for top or bottom teeth. 100% custom — send us your mould kit for a perfect fit. Available in gold and silver finishes.',
    price: 8999, comparePrice: null, badge: 'Custom',
    material: '14K Gold',
    availableMaterials: ['Gold Plated', '10K Gold', '14K Gold', '18K Gold', 'Silver Plated'],
    diamond: { stoneType: 'CZ', caratWeight: 'Custom', cut: 'Excellent', color: 'D', clarity: 'VVS2' },
    sizes: ['Top 6', 'Bottom 6', 'Top 8', 'Bottom 8', 'Full Set'],
    stock: 20, sold: 55, isFeatured: true, isActive: true, images: [],
  },
  {
    name: 'Iced Cross Pendant',
    type: 'Pendant',
    description: 'Large cross pendant fully set with CZ stones. A statement piece for the bold and devout. Heavy, iced, unforgettable.',
    price: 5499, comparePrice: 6999, badge: null,
    material: 'Gold Plated',
    availableMaterials: ['Gold Plated', '14K Gold', '18K Gold', 'White Gold', 'Silver Plated'],
    diamond: { stoneType: 'CZ', caratWeight: '8 ct total', cut: 'Very Good', color: 'F', clarity: 'VS1' },
    sizes: [],
    stock: 25, sold: 78, isFeatured: false, isActive: true, images: [],
  },
  {
    name: 'Moissanite Solitaire Ring',
    type: 'Ring',
    description: 'A stunning solitaire ring featuring a brilliant-cut moissanite stone. Near-identical to a natural diamond at a fraction of the cost.',
    price: 12999, comparePrice: 18999, badge: 'Premium',
    material: '14K Gold',
    availableMaterials: ['14K Gold', '18K Gold', 'White Gold', 'Platinum', 'Rose Gold'],
    diamond: { stoneType: 'Moissanite', caratWeight: '2 ct', cut: 'Excellent', color: 'D', clarity: 'VVS1' },
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 15, sold: 32, isFeatured: true, isActive: true, images: [],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    await User.deleteMany({});

    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products`);

    const admin = await User.create({
      name: 'WYW Admin',
      email: 'admin@thewyw.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9279921642',
    });
    console.log(`✅ Admin created: ${admin.email} / Admin@123`);
    console.log('🌱 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}
seed();
