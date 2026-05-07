const service = require('../services/carrito.service');

exports.savePedido = async (req, res, next) => {
  try {
    console.log('🛒 Pedido recibido:', JSON.stringify(req.body, null, 2));
    const pedido = await service.savePedido(req.body);
    res.status(201).json({ mensaje: 'Pedido registrado correctamente', pedido });
  } catch (e) { next(e); }
};