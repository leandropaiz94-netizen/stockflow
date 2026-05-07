const router     = require('express').Router();
const controller = require('../controllers/productos.controllers');

router.get('/',       controller.getAll);
router.get('/:id',    controller.getById);
router.post('/',      controller.create);
router.put('/:id',    controller.update);
router.delete('/:id', controller.remove);

module.exports = router;