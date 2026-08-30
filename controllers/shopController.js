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
    const filter = activeSlug ? { category: (await Category.findOne({ slug: activeSlug }))?._id } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 }).populate('category');
    res.render('shop/collection', {
      title: 'PNG ONE FASHION',
      categories,
      products,
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
