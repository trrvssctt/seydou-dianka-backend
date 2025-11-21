const prisma = require('../config/prisma');

exports.list = async (req, res, next) => {
  try {
    const items = await prisma.message.findMany({ orderBy: { created_at: 'desc' } });
    res.json(items);
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    const item = await prisma.message.create({ data });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const item = await prisma.message.update({ where: { id: req.params.id }, data: { read: true } });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
