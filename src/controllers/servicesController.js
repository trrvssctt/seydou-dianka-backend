const prisma = require('../config/prisma');

exports.list = async (req, res, next) => {
  try {
    let items;
    try {
      items = await prisma.service.findMany({ orderBy: { order: 'asc' } });
    } catch (err) {
      // Fallback when the Prisma client / DB schema doesn't have `order` yet
      items = await prisma.service.findMany();
    }
    res.json(items);
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const body = req.body || {};
    // Map frontend fields to the current DB fields (backwards compatible)
    const data = {
      title: body.title,
      slug: body.slug,
      // older schema uses short_desc / long_desc / features / price_estimate
      short_desc: body.description || body.short_desc || null,
      long_desc: body.long_desc || null,
      features: body.features || null,
      price_estimate: body.price || body.price_estimate || null,
    };

    const item = await prisma.service.create({ data });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = {
      title: body.title,
      slug: body.slug,
      short_desc: body.description || body.short_desc || undefined,
      long_desc: body.long_desc || undefined,
      features: body.features || undefined,
      price_estimate: body.price || body.price_estimate || undefined,
      // do not force unknown fields here (icon, active, featured, order) unless schema updated
    };
    // Remove undefined keys so Prisma doesn't attempt to set them
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    const item = await prisma.service.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

// Reorder services: expects body = [{ id: string, order: number }, ...]
exports.reorder = async (req, res, next) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'Invalid payload' });

    // If the current Prisma schema doesn't have an `order` field this will fail.
    // Try to update, but return a clear error if not supported.
    try {
      const ops = updates.map((u) => prisma.service.update({ where: { id: u.id }, data: { order: u.order } }));
      await prisma.$transaction(ops);
      return res.json({ ok: true });
    } catch (innerErr) {
      // Likely PrismaClientValidationError due to missing `order` field
      return res.status(501).json({ error: 'Reorder not supported by current DB schema. Run prisma db push to add `order` field.' });
    }
  } catch (e) {
    next(e);
  }
};
