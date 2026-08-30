const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

exports.dashboard = async (req, res, next) => {
  try {
    const [productCount, orderCount, newOrders, revenueAgg] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'new' }),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['paid'] } } },
        { $group: { _id: null, total: { $sum: '$subtotal' } } }
      ])
    ]);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8);
    res.render('admin/dashboard', {
      title: 'Bảng điều khiển',
      layout: 'admin/layout',
      productCount,
      orderCount,
      newOrders,
      revenue: revenueAgg[0]?.total || 0,
      recentOrders
    });
  } catch (err) {
    next(err);
  }
};

exports.products = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('category');
    res.render('admin/products', { title: 'Sản phẩm', layout: 'admin/layout', products });
  } catch (err) {
    next(err);
  }
};

exports.productForm = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    let product = null;
    if (req.params.id) product = await Product.findById(req.params.id);
    res.render('admin/product-form', {
      title: product ? 'Sửa sản phẩm' : 'Thêm sản phẩm',
      layout: 'admin/layout',
      categories,
      product,
      error: null
    });
  } catch (err) {
    next(err);
  }
};

const DIACRITICS_RE = /[̀-ͯ]/g;

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

exports.productSave = async (req, res, next) => {
  try {
    const {
      id,
      nameVi,
      nameEn,
      descriptionVi,
      descriptionEn,
      category,
      price,
      sizes,
      colors,
      stock,
      swatchTone,
      featured,
      slug
    } = req.body;

    const data = {
      name: { vi: nameVi, en: nameEn || nameVi },
      description: { vi: descriptionVi || '', en: descriptionEn || '' },
      category,
      price: Number(price) || 0,
      sizes: (sizes || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      colors: (colors || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      stock: Number(stock) || 0,
      swatchTone: swatchTone || 'bone',
      featured: featured === 'on',
      slug: slug ? slugify(slug) : slugify(nameEn || nameVi)
    };

    if (id) {
      await Product.findByIdAndUpdate(id, data);
    } else {
      await Product.create(data);
    }
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};

exports.productDelete = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};

exports.orders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('admin/orders', { title: 'Đơn hàng', layout: 'admin/layout', orders });
  } catch (err) {
    next(err);
  }
};

exports.orderUpdateStatus = async (req, res, next) => {
  try {
    const update = {};
    if (req.body.status) update.status = req.body.status;
    if (req.body.paymentStatus) update.paymentStatus = req.body.paymentStatus;
    await Order.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/orders');
  } catch (err) {
    next(err);
  }
};
