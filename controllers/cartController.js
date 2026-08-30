const Product = require('../models/Product');

function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

exports.view = (req, res) => {
  const cart = getCart(req);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.render('shop/cart', { title: 'PNG ONE FASHION', cart, subtotal });
};

exports.add = async (req, res, next) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) return res.redirect('back');

    const size = req.body.size || product.sizes[0] || '';
    const qty = Math.max(1, parseInt(req.body.qty, 10) || 1);
    const cart = getCart(req);

    const existing = cart.find((i) => i.productId === String(product._id) && i.size === size);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        productId: String(product._id),
        slug: product.slug,
        name: res.locals.field(product.name),
        price: product.price,
        size,
        qty,
        swatchTone: product.swatchTone
      });
    }
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
};

exports.update = (req, res) => {
  const cart = getCart(req);
  const { productId, size } = req.body;
  const qty = Math.max(1, parseInt(req.body.qty, 10) || 1);
  const item = cart.find((i) => i.productId === productId && i.size === size);
  if (item) item.qty = qty;
  res.redirect('/cart');
};

exports.remove = (req, res) => {
  let cart = getCart(req);
  const { productId, size } = req.body;
  cart = cart.filter((i) => !(i.productId === productId && i.size === size));
  req.session.cart = cart;
  res.redirect('/cart');
};

exports.getCart = getCart;
