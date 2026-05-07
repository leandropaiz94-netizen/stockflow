const service = require('../services/productos.service');

exports.getAll = async (req, res, next) => {
  try {
    const productos = await service.getAll();
    res.json(productos);
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try {
    const producto = await service.getById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const nuevo = await service.create(req.body);
    res.status(201).json(nuevo);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const actualizado = await service.update(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(actualizado);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const eliminado = await service.remove(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (e) { next(e); }
};