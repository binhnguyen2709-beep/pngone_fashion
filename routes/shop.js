const express = require('express');
const router = express.Router();
const shop = require('../controllers/shopController');

router.get('/', shop.home);
router.get('/collection', shop.collection);
router.get('/collection/:slug', shop.collection);
router.get('/product/:slug', shop.product);

module.exports = router;
