// Servidor de la práctica RWD vs. AWD
//   /responsive -> versión A: HTML estático único (RWD)
//   /adaptive   -> versión B: el servidor elige desktop.ejs, tablet.ejs o mobile.ejs (AWD)
const path = require('path');
const express = require('express');
const detectDevice = require('./adaptive/middleware/detectDevice');
const datos = require('./data/productos.json');

const app = express();
const PORT = process.env.PORT || 3000;

const CATEGORIAS = {
  procesador: 'Procesador', gpu: 'Tarjeta gráfica', placa: 'Placa base', ram: 'Memoria RAM',
  almacenamiento: 'Almacenamiento', fuente: 'Fuente de poder', refrigeracion: 'Refrigeración', gabinete: 'Gabinete',
};

const etiqueta = (clave) => {
  const t = clave.replace(/_/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const productos = datos.map((p) => ({
  ...p,
  slug: path.parse(p.imagen).name,
  categoriaEtiqueta: CATEGORIAS[p.categoria],
  precioTxt: '$' + p.precio.toLocaleString('en-US', { minimumFractionDigits: 2 }),
  precioCorto: '$' + Math.round(p.precio).toLocaleString('en-US'),
  specs: Object.entries(p.especificaciones_tecnicas).map(([k, v]) => ({ etiqueta: etiqueta(k), valor: String(v) })),
}));

const precioMax = Math.ceil(Math.max(...productos.map((p) => p.precio)));
const categorias = [...new Set(productos.map((p) => p.categoriaEtiqueta))].sort();
const marcas = [...new Set(productos.map((p) => p.marca))].sort();

app.disable('x-powered-by');

// Versión A (RWD)
app.use('/responsive', express.static(path.join(__dirname, 'responsive')));

// Versión B (AWD): CSS propio y solo las imágenes WebP (comparte los archivos del RWD)
app.use('/adaptive/public', express.static(path.join(__dirname, 'adaptive', 'public')));
app.use('/adaptive/images', express.static(path.join(__dirname, 'responsive', 'images', 'webp')));

app.get('/adaptive', detectDevice, (req, res) => {
  res.render(path.join(__dirname, 'adaptive', 'views', `${req.device}.ejs`), {
    productos, categorias, marcas, precioMax, base: '/adaptive',
  });
});

app.get('/', (req, res) => res.redirect('/responsive/'));

app.listen(PORT, () => {
  console.log(`RWD: http://localhost:${PORT}/responsive/`);
  console.log(`AWD: http://localhost:${PORT}/adaptive`);
});
