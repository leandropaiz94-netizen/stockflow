// ==============================
//  CONFIGURACIÓN
// ==============================
const API_URL = 'http://localhost:3000/api';

// ==============================
//  ESTADO
// ==============================
let productos = [];
let carrito   = JSON.parse(localStorage.getItem('stockflow_carrito')) || [];
let categoriaActiva = 'todos';

// ==============================
//  ELEMENTOS DEL DOM
// ==============================
const productosGrid = document.getElementById('productosGrid');
const emptyState    = document.getElementById('emptyState');
const loadingState  = document.getElementById('loadingState');
const cartDrawer    = document.getElementById('cartDrawer');
const cartOverlay   = document.getElementById('cartOverlay');
const cartToggle    = document.getElementById('cartToggle');
const cartClose     = document.getElementById('cartClose');
const cartItems     = document.getElementById('cartItems');
const cartCount     = document.getElementById('cartCount');
const cartTotal     = document.getElementById('cartTotal');
const confirmBtn    = document.getElementById('confirmBtn');
const toast         = document.getElementById('toast');

// ==============================
//  INICIALIZACIÓN
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  renderCarrito();
  initFiltros();
  initCartToggle();
});

// ==============================
//  FETCH PRODUCTOS DESDE API
// ==============================
async function cargarProductos() {
  loadingState.classList.remove('hidden');
  productosGrid.innerHTML = '';
  emptyState.classList.add('hidden');

  try {
    const res  = await fetch(`${API_URL}/productos`);
    if (!res.ok) throw new Error('Error al obtener productos');
    productos = await res.json();
    renderProductos(productos);
  } catch (err) {
    console.error(err);
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyState.querySelector('p').textContent = 'No se pudo conectar al servidor.';
  }
}

// ==============================
//  RENDER GRILLA DE PRODUCTOS
// ==============================
function renderProductos(lista) {
  loadingState.classList.add('hidden');
  productosGrid.innerHTML = '';

  const filtrados = categoriaActiva === 'todos'
    ? lista
    : lista.filter(p => p.categoria === categoriaActiva);

  if (filtrados.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtrados.forEach((producto, i) => {
    const card = crearCard(producto, i);
    productosGrid.appendChild(card);
  });
}

// ==============================
//  CREAR CARD DE PRODUCTO
// ==============================
function crearCard(producto, index) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.style.animationDelay = `${index * 0.05}s`;

  const sinStock = producto.stock <= 0;
  const precio   = producto.precio ? `$${producto.precio.toLocaleString('es-AR')}` : 'Sin precio';

  card.innerHTML = `
    <div class="product-card__badge badge--${producto.categoria || 'descartable'}">
      ${iconCategoria(producto.categoria)} ${producto.categoria || 'sin categoría'}
    </div>
    <div class="product-card__name">${producto.nombre}</div>
    ${producto.descripcion ? `<div class="product-card__desc">${producto.descripcion}</div>` : ''}
    <div class="product-card__meta">
      <div class="product-card__stock">
        Stock: <span>${producto.stock ?? '—'} ${producto.unidad || ''}</span>
      </div>
      <div class="product-card__price">${precio}</div>
    </div>
    <button class="product-card__btn" data-id="${producto._id}" ${sinStock ? 'disabled' : ''}>
      ${sinStock ? '✕ Sin stock' : '+ Agregar al pedido'}
    </button>
  `;

  if (!sinStock) {
    card.querySelector('.product-card__btn').addEventListener('click', () => {
      agregarAlCarrito(producto);
    });
  }

  return card;
}

function iconCategoria(cat) {
  const icons = {
    descartable:  '◈',
    instrumental: '◇',
    medicamento:  '◉',
    equipo:       '◆'
  };
  return icons[cat] || '○';
}

// ==============================
//  FILTROS
// ==============================
function initFiltros() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaActiva = btn.dataset.cat;
      renderProductos(productos);
    });
  });
}

// ==============================
//  CARRITO — LÓGICA
// ==============================
function agregarAlCarrito(producto) {
  const existente = carrito.find(i => i.productoId === producto._id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      productoId: producto._id,
      nombre:     producto.nombre,
      cantidad:   1,
      precio:     producto.precio || 0
    });
  }
  guardarCarrito();
  renderCarrito();
  showToast(`"${producto.nombre}" agregado al pedido`, 'success');
  abrirCarrito();
}

function cambiarCantidad(productoId, delta) {
  const item = carrito.find(i => i.productoId === productoId);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.productoId !== productoId);
  }
  guardarCarrito();
  renderCarrito();
}

function eliminarDelCarrito(productoId) {
  carrito = carrito.filter(i => i.productoId !== productoId);
  guardarCarrito();
  renderCarrito();
}

function guardarCarrito() {
  localStorage.setItem('stockflow_carrito', JSON.stringify(carrito));
}

function calcularTotal() {
  return carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
}

// ==============================
//  CARRITO — RENDER
// ==============================
function renderCarrito() {
  // Contador
  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  cartCount.textContent = totalItems;

  // Total
  const total = calcularTotal();
  cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;

  // Botón confirmar
  confirmBtn.disabled = carrito.length === 0;

  // Items
  if (carrito.length === 0) {
    cartItems.innerHTML = '<p class="cart-drawer__empty">El carrito está vacío.</p>';
    return;
  }

  cartItems.innerHTML = '';
  carrito.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item__info">
        <div class="cart-item__name">${item.nombre}</div>
        <div class="cart-item__price">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
        <div class="cart-item__controls">
          <button class="cart-item__qty-btn" data-action="dec" data-id="${item.productoId}">−</button>
          <span class="cart-item__qty">${item.cantidad}</span>
          <button class="cart-item__qty-btn" data-action="inc" data-id="${item.productoId}">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-id="${item.productoId}" title="Eliminar">✕</button>
    `;
    div.querySelector('[data-action="inc"]').addEventListener('click', () => cambiarCantidad(item.productoId, 1));
    div.querySelector('[data-action="dec"]').addEventListener('click', () => cambiarCantidad(item.productoId, -1));
    div.querySelector('.cart-item__remove').addEventListener('click', () => eliminarDelCarrito(item.productoId));
    cartItems.appendChild(div);
  });
}

// ==============================
//  CONFIRMAR PEDIDO → API
// ==============================
confirmBtn.addEventListener('click', async () => {
  if (carrito.length === 0) return;

  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Enviando...';

  const pedido = {
    items: carrito,
    total: calcularTotal()
  };

  try {
    const res = await fetch(`${API_URL}/carrito`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(pedido)
    });

    if (!res.ok) throw new Error('Error al confirmar pedido');

    // Vaciar carrito
    carrito = [];
    guardarCarrito();
    renderCarrito();
    cerrarCarrito();
    showToast('¡Pedido confirmado correctamente! ✓', 'success');

  } catch (err) {
    console.error(err);
    showToast('Error al enviar el pedido. Intentá de nuevo.', 'error');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirmar pedido';
  }
});

// ==============================
//  TOGGLE CARRITO
// ==============================
function initCartToggle() {
  cartToggle.addEventListener('click', abrirCarrito);
  cartClose.addEventListener('click', cerrarCarrito);
  cartOverlay.addEventListener('click', cerrarCarrito);
}

function abrirCarrito() {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ==============================
//  TOAST
// ==============================
let toastTimer;
function showToast(msg, tipo = '') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className   = `toast ${tipo} show`;
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
