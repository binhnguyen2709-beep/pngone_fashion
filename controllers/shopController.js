const Product = require('../models/Product');
const Category = require('../models/Category');

// Static lookbook imagery for the homepage — decorative only, not tied to real
// (purchasable) products. Update this list by hand when the lookbook changes.
const LOOKBOOK = [
  { image: '/images/products/ao-khoac-len-oxblood.jpg', name: { vi: 'Áo khoác da Forest', en: 'Forest Leather Jacket' } },
  { image: '/images/products/dam-lua-ivory.jpg', name: { vi: 'Đầm lụa Ink', en: 'Ink Silk Slip Dress' } },
  { image: '/images/products/ao-so-mi-lanh-brass.jpg', name: { vi: 'Áo sơ mi lanh Bone', en: 'Bone Linen Shirt' } },
  { image: '/images/products/quan-tay-ink.jpg', name: { vi: 'Quần tây Ink', en: 'Ink Tailored Trousers' } },
  { image: '/images/products/chan-vay-forest.jpg', name: { vi: 'Chân váy midi Denim', en: 'Denim Midi Skirt' } },
  { image: '/images/products/dam-so-mi-ink.jpg', name: { vi: 'Đầm sơ mi Bone', en: 'Bone Shirt Dress' } }
];

exports.home = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.render('shop/home', { title: 'PNG ONE FASHION', categories, lookbook: LOOKBOOK });
  } catch (err) {
    next(err);
  }
};

exports.collection = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    const activeSlug = req.params.slug || null;
    const activeCategories = activeSlug ? categories.filter((c) => c.slug === activeSlug) : categories;
    const products = await Product.find({ category: { $in: activeCategories.map((c) => c._id) } })
      .sort({ createdAt: -1 })
      .populate('category');

    const groups = activeCategories
      .map((category) => ({
        category,
        products: products.filter((p) => p.category && p.category._id.equals(category._id))
      }))
      .filter((group) => group.products.length > 0);

    res.render('shop/collection', {
      title: 'PNG ONE FASHION',
      categories,
      groups,
      activeSlug
    });
  } catch (err) {
    next(err);
  }
};

exports.product = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
    if (!product) return res.status(404).render('errors/404', { title: 'PNG ONE FASHION' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .populate('category');
    res.render('shop/product', { title: 'PNG ONE FASHION', product, related });
  } catch (err) {
    next(err);
  }
};
