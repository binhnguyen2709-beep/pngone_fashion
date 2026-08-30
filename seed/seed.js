require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Admin = require('../models/Admin');

const categories = [
  { slug: 'ao-khoac', name: { vi: 'Áo khoác', en: 'Outerwear' }, order: 1 },
  { slug: 'dam', name: { vi: 'Đầm', en: 'Dresses' }, order: 2 },
  { slug: 'ao-so-mi', name: { vi: 'Áo sơ mi & Áo', en: 'Shirts & Tops' }, order: 3 },
  { slug: 'quan-vay', name: { vi: 'Quần & Chân váy', en: 'Trousers & Skirts' }, order: 4 }
];

const products = [
  {
    slug: 'ao-khoac-len-oxblood',
    name: { vi: 'Áo khoác len Oxblood', en: 'Oxblood Wool Coat' },
    description: {
      vi: 'Áo khoác len dáng dài, đường may thủ công, sản xuất theo lô giới hạn.',
      en: 'A long wool coat with hand-finished seams, produced in a limited run.'
    },
    categorySlug: 'ao-khoac',
    price: 8900000,
    swatchTone: 'oxblood',
    sizes: ['S', 'M', 'L'],
    featured: true
  },
  {
    slug: 'dam-lua-ivory',
    name: { vi: 'Đầm lụa Ivory', en: 'Ivory Silk Slip Dress' },
    description: {
      vi: 'Đầm lụa rũ mềm, đường cắt tối giản, phù hợp cả ngày lẫn tối.',
      en: 'Fluid silk with a minimal cut, equally at home by day or evening.'
    },
    categorySlug: 'dam',
    price: 6400000,
    swatchTone: 'bone',
    sizes: ['XS', 'S', 'M'],
    featured: true
  },
  {
    slug: 'ao-so-mi-lanh-brass',
    name: { vi: 'Áo sơ mi lanh Brass', en: 'Brass Linen Shirt' },
    description: {
      vi: 'Áo sơ mi vải lanh tự nhiên, khuy đồng thau, form suông thoải mái.',
      en: 'Natural linen shirt with brass buttons and a relaxed silhouette.'
    },
    categorySlug: 'ao-so-mi',
    price: 3200000,
    swatchTone: 'brass',
    sizes: ['S', 'M', 'L', 'XL'],
    featured: true
  },
  {
    slug: 'quan-tay-ink',
    name: { vi: 'Quần tây Ink', en: 'Ink Tailored Trousers' },
    description: {
      vi: 'Quần tây ống suông, cạp cao, chất liệu wool blend co giãn nhẹ.',
      en: 'Straight-leg tailored trousers, high waist, lightly stretched wool blend.'
    },
    categorySlug: 'quan-vay',
    price: 4100000,
    swatchTone: 'ink',
    sizes: ['S', 'M', 'L'],
    featured: true
  },
  {
    slug: 'chan-vay-forest',
    name: { vi: 'Chân váy midi Forest', en: 'Forest Midi Skirt' },
    description: {
      vi: 'Chân váy midi xếp ly nhẹ, sắc xanh forest trầm ấm.',
      en: 'A softly pleated midi skirt in a deep, warm forest green.'
    },
    categorySlug: 'quan-vay',
    price: 3600000,
    swatchTone: 'forest',
    sizes: ['XS', 'S', 'M', 'L'],
    featured: false
  },
  {
    slug: 'dam-so-mi-ink',
    name: { vi: 'Đầm sơ mi Ink', en: 'Ink Shirt Dress' },
    description: {
      vi: 'Đầm sơ mi dáng dài, thắt lưng rời, mặc được cả bốn mùa.',
      en: 'A long shirt dress with a detachable belt, wearable across seasons.'
    },
    categorySlug: 'dam',
    price: 5200000,
    swatchTone: 'ink',
    sizes: ['S', 'M', 'L'],
    featured: false
  }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Seeding...');

  const categoryDocs = {};
  for (const c of categories) {
    const doc = await Category.findOneAndUpdate({ slug: c.slug }, c, {
      upsert: true,
      new: true
    });
    categoryDocs[c.slug] = doc;
  }

  for (const p of products) {
    const { categorySlug, ...rest } = p;
    await Product.findOneAndUpdate(
      { slug: p.slug },
      { ...rest, category: categoryDocs[categorySlug]._id },
      { upsert: true, new: true }
    );
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pngonefashion.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-password';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await Admin.findOneAndUpdate(
    { email: adminEmail },
    { email: adminEmail, passwordHash, name: 'PNG ONE Admin' },
    { upsert: true, new: true }
  );

  console.log(`Seeded ${categories.length} categories, ${products.length} products.`);
  console.log(`Admin login: ${adminEmail} / (password from .env)`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
