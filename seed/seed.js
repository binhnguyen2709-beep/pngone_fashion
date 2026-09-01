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
    name: { vi: 'Áo khoác da Forest', en: 'Forest Leather Jacket' },
    description: {
      vi: 'Áo khoác da form crop, sắc xanh rêu trầm, đường may thủ công, sản xuất theo lô giới hạn.',
      en: 'A cropped faux-leather jacket in deep forest green with hand-finished seams, produced in a limited run.'
    },
    categorySlug: 'ao-khoac',
    price: 8900000,
    images: ['/images/products/ao-khoac-len-oxblood.jpg'],
    swatchTone: 'forest',
    sizes: ['S', 'M', 'L'],
    featured: true
  },
  {
    slug: 'dam-lua-ivory',
    name: { vi: 'Đầm lụa Ink', en: 'Ink Silk Slip Dress' },
    description: {
      vi: 'Đầm lụa dây mảnh, sắc đen ánh kim, đường cắt tối giản, phù hợp cả ngày lẫn tối.',
      en: 'Fluid silk in a deep charcoal tone with a minimal cut, equally at home by day or evening.'
    },
    categorySlug: 'dam',
    price: 6400000,
    images: ['/images/products/dam-lua-ivory.jpg'],
    swatchTone: 'ink',
    sizes: ['XS', 'S', 'M'],
    featured: true
  },
  {
    slug: 'ao-so-mi-lanh-brass',
    name: { vi: 'Áo sơ mi lanh Bone', en: 'Bone Linen Shirt' },
    description: {
      vi: 'Áo sơ mi vải lanh tự nhiên, form suông thoải mái, sắc trắng ngà dịu nhẹ.',
      en: 'Natural linen shirt with a relaxed silhouette in a soft bone white.'
    },
    categorySlug: 'ao-so-mi',
    price: 3200000,
    images: ['/images/products/ao-so-mi-lanh-brass.jpg'],
    swatchTone: 'bone',
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
    images: ['/images/products/quan-tay-ink.jpg'],
    swatchTone: 'ink',
    sizes: ['S', 'M', 'L'],
    featured: true
  },
  {
    slug: 'chan-vay-forest',
    name: { vi: 'Chân váy midi Denim', en: 'Denim Midi Skirt' },
    description: {
      vi: 'Chân váy midi vải denim nhẹ, thắt eo tự buộc, phom xòe nhẹ nhàng.',
      en: 'A lightweight denim midi skirt with a self-tie waist and a softly flared silhouette.'
    },
    categorySlug: 'quan-vay',
    price: 3600000,
    images: ['/images/products/chan-vay-forest.jpg'],
    swatchTone: 'bone',
    sizes: ['XS', 'S', 'M', 'L'],
    featured: true
  },
  {
    slug: 'dam-so-mi-ink',
    name: { vi: 'Đầm sơ mi Bone', en: 'Bone Shirt Dress' },
    description: {
      vi: 'Đầm sơ mi dáng dài, thắt lưng rời, sắc trắng ngà ấm áp, mặc được cả bốn mùa.',
      en: 'A long shirt dress with a detachable belt in a warm bone white, wearable across seasons.'
    },
    categorySlug: 'dam',
    price: 5200000,
    images: ['/images/products/dam-so-mi-ink.jpg'],
    swatchTone: 'bone',
    sizes: ['S', 'M', 'L'],
    featured: true
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
