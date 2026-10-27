# Catálogo de Hardware: RWD vs. AWD

Práctica de laboratorio de Diseño de Interfaces Web. Un mismo catálogo de componentes de servidor
(12 productos, filtros laterales y gráfico de comparativa) implementado de dos formas y comparado con
Chrome DevTools y Lighthouse:

| Ruta           | Versión                       | Cómo se adapta                                                       |
|----------------|-------------------------------|----------------------------------------------------------------------|
| `/responsive/` | A: RWD (Responsive Web Design)| El navegador adapta el layout con CSS Grid, Flexbox y media queries. |
| `/adaptive`    | B: AWD (Adaptive Web Design)  | Segun el dispositivo, User-Agent envía `desktop.ejs` o `mobile.ejs`. |

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (Express 5)

## Instalación y arranque local

```bash
npm install
npm start
```

El servidor queda en http://localhost:3000:

- RWD: http://localhost:3000/responsive/
- AWD: http://localhost:3000/adaptive

Para usar otro puerto: `PORT=3100 npm start` (en PowerShell: `$env:PORT=3100; npm start`).

## Cómo probar la versión adaptativa

La detección se hace con el User-Agent, no con el ancho de la ventana. Redimensionar una ventana de escritorio
no cambia la vista: hay que emular un dispositivo móvil.

1. Abre `/adaptive` y DevTools (F12).
2. Activa el modo dispositivo (Ctrl+Shift+M) y elige iPhone 12 Pro (390 × 844).
3. Recarga la página: el título de la pestaña será "AWD Móvil" y no habrá gráfico ni tabla de especificaciones.

## Estructura del proyecto

```
ComponentesHardware/
├── server.js                       # Express: sirve /responsive y /adaptive
├── package.json
├── data/
│   └── productos.json              # Los 12 productos (compartidos por ambas versiones)
├── responsive/                     # Versión A (RWD)
│   ├── index.html                  # Único HTML para todos los clientes
│   ├── main.js                     # Menú desplegable de filtros en pantallas pequeñas
│   ├── css/styles.css              # Grid + Flexbox + media queries (640 px y 1025 px)
│   └── images/
│       ├── webp/                   # Variantes de 400 y 800 px
│       └── jpg/                    # Respaldo para navegadores sin WebP
├── adaptive/                       # Versión B (AWD)
│   ├── middleware/detectDevice.js  # Detección de agente con express-useragent
│   ├── views/
│   │   ├── desktop.ejs             # Vista completa: filtros, gráfico y tabla de especificaciones
│   │   └── mobile.ejs              # Vista ligera: sin gráfico, sin tabla y sin JavaScript
│   └── public/css/                 # desktop.css y mobile.css
└── reporte/                        # Entregable: métricas, capturas y análisis crítico
    ├── RWDvsAWD.pdf                # Reporte técnico (tablas, capturas y análisis crítico)
    └── capturas/                   # Capturas originales de DevTools y Lighthouse
```

## Versión A: RWD (`/responsive/`)

- Un solo archivo HTML servido a cualquier cliente.
- Breakpoints: móvil (< 640 px, 1 columna), tablet (640 – 1024 px, 2 columnas) y desktop (> 1024 px, barra lateral fija y 3 columnas).
- Imágenes: `<picture>` con `<source type="image/webp">` y `srcset` de 400 y 800 px, más un `<img>` JPG de respaldo.
  Las imágenes llevan `width`/`height` para evitar saltos de layout (CLS) y carga diferida (`loading="lazy"`).
- Barra lateral de filtros: en pantallas pequeñas se convierte en un menú desplegable que se abre y cierra
  con una transición suave, sin recargar la página.

## Versión B: AWD (`/adaptive`)

- `detectDevice.js` analiza el User-Agent con `express-useragent` y deja `req.device` en `mobile` o `desktop`.
- `server.js` renderiza la plantilla que corresponde (`desktop.ejs` o `mobile.ejs`), cada una con su propia hoja de estilos.
- **Vista móvil:** el servidor no incluye en el DOM el gráfico de comparativa ni la tabla completa de especificaciones,
  ni el panel de filtros; usa miniaturas de 400 px y no envía JavaScript.
- **Vista desktop:** filtros, gráfico, tarjetas con imágenes de 800 px y tabla completa.
- Ambas vistas usan solo las imágenes WebP de `responsive/images/webp/`.

## Medición de rendimiento

Condiciones usadas en el reporte (Chrome DevTools): viewport 390 × 844 (iPhone 12 Pro), red **Slow 4G**
(equivalente al antiguo Fast 3G), CPU **4× slowdown**, caché desactivada, ventana de incógnito, sin scroll
y 3 corridas por ruta (se reporta la mediana). Los resultados y las capturas están en [`reporte/`](reporte/).

## Notas

- El servidor no comprime las respuestas (gzip), igual para ambas rutas, para que la comparación sea justa.
- Los filtros laterales de ambas versiones son solo de interfaz: no filtran los productos.
- Las imágenes ya están generadas en `responsive/images/`.