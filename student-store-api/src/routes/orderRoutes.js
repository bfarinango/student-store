const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderControllers');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

router.post('/:id/items', controller.addItems);
router.get('/:id/total', controller.getTotal);

module.exports = router;