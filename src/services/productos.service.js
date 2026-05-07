const Producto = require('../models/producto.model');

const getAll  = ()           => Producto.find();
const getById = (id)         => Producto.findById(id);
const create  = (data)       => Producto.create(data);
const update  = (id, data)   => Producto.findByIdAndUpdate(id, data, { new: true });
const remove  = (id)         => Producto.findByIdAndDelete(id);

module.exports = { getAll, getById, create, update, remove };