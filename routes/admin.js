const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/adminAuth');
const admin = require('../controllers/adminController');

router.use(requireAdmin);

router.get('/', admin.dashboard);
router.get('/products', admin.products);
router.get('/products/new', admin.productForm);
router.get('/products/:id/edit', admin.productForm);
router.post('/products', admin.productSave);
router.post('/products/:id/delete', admin.productDelete);
router.get('/orders', admin.orders);
router.post('/orders/:id/status', admin.orderUpdateStatus);
router.post('/orders/:id/delete', admin.orderDelete);

module.exports = router;
