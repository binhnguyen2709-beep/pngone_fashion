const express = require('express');
const router = express.Router();
const checkout = require('../controllers/checkoutController');

router.get('/', checkout.form);
router.post('/place-order', checkout.placeOrder);
router.get('/vnpay-return', checkout.vnpayReturn);
router.post('/momo-notify', express.json(), checkout.momoNotify);
router.get('/momo-return', checkout.momoReturn);
router.get('/order-success/:code', checkout.success);

module.exports = router;
