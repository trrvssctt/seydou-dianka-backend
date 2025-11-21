const router = require('express').Router();

const users = require('./users');
const projects = require('./projects');
const services = require('./services');
const messages = require('./messages');
const auth = require('./auth');

router.use('/auth', auth);
router.use('/users', users);
router.use('/projects', projects);
router.use('/services', services);
router.use('/messages', messages);

router.get('/', (req, res) => res.json({ ok: true, api: '/api' }));

module.exports = router;
