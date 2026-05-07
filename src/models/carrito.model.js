const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  nombre:     { type: String, required: true },
  cantidad:   { type: Number, required: true, min: 1 },
  precio:     { type: Number, required: true }
});

const carritoSchema = new mongoose.Schema({
  items:  { type: [itemSchema], required: true },
  total:  { type: Number, required: true },
  estado: { type: String, enum: ['pendiente', 'procesado'], default: 'pendiente' }
}, { timestamps: true });

module.exports = mongoose.model('Carrito', carritoSchema);