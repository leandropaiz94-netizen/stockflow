const Carrito = require('../models/carrito.model');

const savePedido = (data) => Carrito.create(data);

module.exports = { savePedido };