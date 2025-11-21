const router = require('express').Router();
const controller = require('../controllers/servicesController');
const auth = require('../middleware/auth');

router.get('/', controller.list);
router.get('/:id', controller.get);
router.put('/reorder', auth, controller.reorder);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;
