const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');

const productosRoutes = require('./routes/productos.routes');
const carritoRoutes = require('./routes/carrito.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/productos', productosRoutes);
app.use('/api/carrito', carritoRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'StockFlow API funcionando ✅' });
});

app.use(errorHandler);

module.exports = app;