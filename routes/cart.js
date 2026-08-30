const express = require('express');
const router = express.Router();
const cart = require('../controllers/cartController');

router.get('/', cart.view);
router.post('/add', cart.add);
router.post('/update', cart.update);
router.post('/remove', cart.remove);

module.exports = router;
