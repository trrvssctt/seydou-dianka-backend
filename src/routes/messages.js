const router = require('express').Router();
const controller = require('../controllers/messagesController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.list);
router.get('/:id', auth, controller.get);
router.post('/', controller.create); // public: contact form
router.post('/:id/read', auth, controller.markRead);
router.delete('/:id', auth, controller.remove);

module.exports = router;
