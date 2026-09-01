const Product = require('../models/Product');
const Category = require('../models/Category');

exports.home = async (req, res, next) => {
  try {
    const [categories, featured] = await Promise.all([
      Category.find().sort({ order: 1 }),
      Product.find({ featured: true }).sort({ createdAt: -1 }).limit(6).populate('category')
    ]);
    res.render('shop/home', { title: 'PNG ONE FASHION', categories, featured });
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
