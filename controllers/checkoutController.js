const Order = require('../models/Order');
const { getCart } = require('./cartController');
const vnpay = require('../services/vnpay');
const momo = require('../services/momo');
const vietqr = require('../services/vietqr');

function makeOrderCode() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PNG${stamp}${rand}`;
}

exports.form = (req, res) => {
  const cart = getCart(req);
  if (!cart.length) return res.redirect('/cart');
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.render('shop/checkout', { title: 'PNG ONE FASHION', cart, subtotal, error: null });
};

exports.placeOrder = async (req, res, next) => {
  try {
    const cart = getCart(req);
    if (!cart.length) return res.redirect('/cart');

    const { fullName, phone, email, address, city, note, paymentMethod } = req.body;
    if (!fullName || !phone || !address || !city) {
      const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      return res.status(400).render('shop/checkout', {
        title: 'PNG ONE FASHION',
        cart,
        subtotal,
        error: res.locals.locale === 'en' ? 'Please fill in all required fields.' : 'Vui lòng điền đầy đủ thông tin bắt buộc.'
      });
    }

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const order = await Order.create({
      orderCode: makeOrderCode(),
      items: cart.map((i) => ({
        product: i.productId,
        name: i.name,
        price: i.price,
        size: i.size,
        qty: i.qty,
        swatchTone: i.swatchTone
      })),
      subtotal,
      customer: { fullName, phone, email, address, city, note },
      paymentMethod,
      locale: res.locals.locale
    });

    if (paymentMethod === 'vnpay') {
      const url = vnpay.buildPaymentUrl({
        orderCode: order.orderCode,
        amount: subtotal,
        ipAddr: req.ip,
        orderInfo: `Thanh toan don hang ${order.orderCode}`
      });
      return res.redirect(url);
    }

    if (paymentMethod === 'momo') {
      const result = await momo.createPayment({
        orderCode: order.orderCode,
        amount: subtotal,
        orderInfo: `Thanh toan don hang ${order.orderCode}`
      });
      if (result && result.payUrl) return res.redirect(result.payUrl);
      order.paymentStatus = 'failed';
      await order.save();
      return res.redirect(`/checkout/order-success/${order.orderCode}`);
    }

    req.session.cart = [];
    res.redirect(`/checkout/order-success/${order.orderCode}`);
  } catch (err) {
    next(err);
  }
};

exports.vnpayReturn = async (req, res, next) => {
  try {
    const ok = vnpay.verifyReturn(req.query);
    const order = await Order.findOne({ orderCode: req.query.vnp_TxnRef });
    if (order) {
      order.paymentStatus = ok ? 'paid' : 'failed';
      await order.save();
      req.session.cart = [];
      return res.redirect(`/checkout/order-success/${order.orderCode}`);
    }
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};

exports.momoNotify = async (req, res, next) => {
  try {
    const ok = momo.verifyNotify(req.body);
    const order = await Order.findOne({ orderCode: req.body.orderId });
    if (order) {
      order.paymentStatus = ok ? 'paid' : 'failed';
      await order.save();
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.momoReturn = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderCode: req.query.orderId });
    if (order) {
      req.session.cart = [];
      return res.redirect(`/checkout/order-success/${order.orderCode}`);
    }
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};

exports.success = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderCode: req.params.code });
    if (!order) return res.status(404).render('errors/404', { title: 'PNG ONE FASHION' });
    const qrUrl =
      order.paymentMethod === 'bank_qr'
        ? vietqr.buildQrUrl({ amount: order.subtotal, addInfo: order.orderCode })
        : null;
    const bankInfo = {
      name: process.env.BANK_NAME,
      accountNo: process.env.BANK_ACCOUNT_NO,
      accountName: process.env.BANK_ACCOUNT_NAME
    };
    res.render('shop/order-success', { title: 'PNG ONE FASHION', order, qrUrl, bankInfo });
  } catch (err) {
    next(err);
  }
};
