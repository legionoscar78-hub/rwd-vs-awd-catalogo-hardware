# Tabla de métricas de rendimiento: RWD vs. AWD (móvil)

## Condiciones de la prueba

| Parámetro | Valor |
|---|---|
| Navegador | Google Chrome 156.0.8078.48, ventana de incógnito |
| Dispositivo emulado | iPhone 12 Pro, viewport 390 × 844 px (DPR 3, User-Agent móvil) |
| Red | Slow 4G (equivalente al antiguo Fast 3G: ~1.6 Mbps, latencia alta) |
| CPU | 4× slowdown |
| Caché | Desactivada (*Disable cache*) |
| Servidor | Node.js/Express local, sin compresión, mismo proceso para ambas rutas |
| Escenario | Carga inicial, sin scroll |
| Repeticiones | 3 corridas por ruta; se reporta la mediana |
| Rutas | RWD: `/responsive/` · AWD: `/adaptive` |

## Corridas individuales

| Ruta | Corrida | LCP | CLS |
|---|---|---|---|
| RWD | 1 | 1.75 s | 0 |
| RWD | 2 | 1.69 s | 0 |
| RWD | 3 | 1.79 s | 0 |
| AWD | 1 | 2.11 s | 0 |
| AWD | 2 | 2.22 s | 0 |
| AWD | 3 | 2.13 s | 0 |

## Tabla comparativa (medianas)

| Métrica / Indicador | RWD (Móvil) | AWD (Móvil) | Delta (%) |
|---|---|---|---|
| Tamaño del documento inicial (HTML transferido) | 33.3 KB | 8.6 KB | -74.2% |
| Peso total de la página (Payload completo) | 159 KB | 89.1 KB | -44.0% |
| Número de peticiones HTTP (Requests) | 9 reqs | 14 reqs | +55.6% |
| Largest Contentful Paint (LCP) | 1.75 s | 2.13 s | +21.7% |
| Cumulative Layout Shift (CLS) | 0 | 0 | N/A |

Delta (%) = (AWD − RWD) / RWD × 100. En CLS no se puede calcular porque la base es 0.

## Evidencia complementaria: Lighthouse (Navigation, Mobile, Performance)

Lighthouse aplica su propio throttling **simulado** (estima los tiempos con un modelo a partir de una carga
sin límites de red) y emula otro dispositivo móvil, por lo que sus cifras no son directamente comparables con las
de DevTools (throttling aplicado, Slow 4G + CPU 4×, iPhone 12 Pro).

| Dato | RWD | AWD | Delta |
|---|---|---|---|
| Performance score | 67 | 94 | +27 puntos (+40.3%) |
| First Contentful Paint (FCP) | 2.1 s | 1.9 s | -9.5% |
| Largest Contentful Paint (LCP) | 2.9 s | 2.1 s | -27.6% |
| Total Blocking Time (TBT) | 1,300 ms | 170 ms | -86.9% |
| Cumulative Layout Shift (CLS) | 0 | 0 | N/A |
| Speed Index | 3.8 s | 3.1 s | -18.4% |

Nota: con DevTools el AWD obtuvo **mayor** LCP (2.13 s contra 1.75 s) y con Lighthouse **menor** (2.1 s contra
2.9 s). La discusión de esta diferencia está en [analisis-critico.md](analisis-critico.md).

## Capturas

- Network: `capturas/peticionesResponsive.png`, `capturas/peticionesAdaptive.png`
- Performance (3 corridas por ruta): `capturas/corrida1responsive.png` a `corrida3responsive.png` y
  `capturas/corrida1adaptive.png` a `corrida3adaptive.png`
- Lighthouse: `capturas/responsiveLighthouse.png`, `capturas/adaptiveLighthouse.png`
