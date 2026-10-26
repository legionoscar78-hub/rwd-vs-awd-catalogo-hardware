# Análisis crítico: ¿cuándo recomendar AWD en lugar de RWD?

## 1. Qué mostró la evidencia

Medido en móvil (390 × 844, Slow 4G, CPU 4×, sin caché, mediana de 3 corridas):

| Métrica | RWD | AWD | Delta |
|---|---|---|---|
| HTML transferido | 33.3 KB | 8.6 KB | -74.2% |
| Payload total | 159 KB | 89.1 KB | -44.0% |
| Peticiones HTTP | 9 | 14 | +55.6% |
| LCP (DevTools) | 1.75 s | 2.13 s | +21.7% |
| LCP / score (Lighthouse) | 2.9 s / 67 | 2.1 s / 94 | -27.6% / +27 pts |
| TBT (Lighthouse) | 1,300 ms | 170 ms | -86.9% |
| CLS | 0 | 0 | N/A |

El AWD cumple su promesa principal: el servidor deja fuera del DOM móvil el gráfico y la tabla de
especificaciones, y el documento baja 74%. El payload baja 44%, pero las peticiones **suben** y el LCP depende de
la herramienta de medición. Ninguna cifra es inventada, pero tampoco todas apuntan en el mismo sentido, y eso es
parte del resultado.

## 2. Por qué el AWD hizo más peticiones y el LCP no fue mejor en DevTools

- **Más peticiones.** La carga diferida (`loading="lazy"`) de Chrome descarga una imagen cuando está a unos
  2500 px de la pantalla en redes lentas. Las tarjetas del RWD miden unos 540 px, así que solo 6 de las 12
  imágenes entran en ese rango (9 peticiones: HTML, CSS, JS y 6 imágenes). La lista compacta del AWD mide unos
  118 px por producto, de modo que las 12 miniaturas quedan dentro del rango y se descargan todas (14 peticiones:
  HTML, CSS y 12 imágenes). Cada imagen del AWD pesa menos (~6 KB contra ~20 KB), por eso el payload sigue bajando.
- **LCP en DevTools.** En una reproducción de diagnóstico (Chrome controlado por protocolo, mismas condiciones) la
  primera imagen del AWD se pintó a 1.46 s, antes que la del RWD (1.77 s). Sin embargo, el LCP final se movió a
  la imagen de otro producto, pintada a 2.2 s, porque su área es 0.5% mayor (10 796 contra 10 740 px²) por
  redondeos de medio píxel, y Chrome reemplaza el candidato LCP cada vez que aparece uno más grande. Además, las
  12 imágenes comparten el mismo ancho de banda y las 6 conexiones de HTTP/1.1. Es un efecto del diseño de la
  lista (muchas imágenes casi idénticas), no de que el AWD sea más lento por naturaleza.
- **LCP y TBT en Lighthouse.** Lighthouse estima el tiempo a partir de una carga sin límites de red, donde las
  imágenes llegan casi juntas, y por eso no sufre esa reasignación del candidato LCP. Además registró una diferencia
  grande en el Total Blocking Time (1,300 ms en el RWD contra 170 ms en el AWD), que pesa mucho en el score de 67
  contra 94. Es consistente con el resumen de Performance de DevTools, donde el tiempo de *Rendering* fue de 585 a
  720 ms en el RWD y de 133 a 290 ms en el AWD. Esto sugiere que, con CPU 4×, el DOM mayor del RWD (tabla completa,
  gráfico y 12 tarjetas con `<picture>`) cuesta más trabajo del hilo principal: el beneficio del AWD apareció más en
  el trabajo de CPU del cliente y en los bytes que en la red. Conclusión metodológica: el LCP es sensible a la
  herramienta y a la forma de la página; los bytes y el DOM son medidas más estables.

## 3. Costos de CDN, backend y mantenimiento

**CDN y caché.** El RWD es un único archivo con una sola clave de caché: máxima tasa de aciertos. El AWD
devuelve contenido distinto para la misma URL, así que necesita `Vary: User-Agent`, y esa cabecera fragmenta la
caché en miles de cadenas de User-Agent. Se mitiga normalizando el User-Agent a una clase (`mobile` o `desktop`)
en el borde del CDN y usándola como clave de caché, lo que exige un CDN con esa capacidad y configuración adicional.

**Ahorro de transferencia.** Por visita móvil, el AWD ahorró unos 70 KB (159 - 89.1). Con un precio de egreso
**supuesto** de US$0.08 por GB (valor ilustrativo, no una tarifa real), un millón de visitas móviles ahorra
alrededor de 70 GB, es decir unos US$5.6. Incluso a 100 millones de visitas al mes serían del orden de US$560.
Además, con compresión gzip la diferencia de HTML se reduce: el panel Insights estimó un ahorro de 22.1 KB solo por
comprimir el HTML del RWD, que esta práctica no activó.

**Backend.** El RWD se sirve como archivo estático. El AWD renderiza una plantilla EJS por cada petición no
cacheada y ejecuta la detección de agente. Su costo por petición es bajo, pero no es cero ni se midió aquí, y
crece con el tráfico si la caché del borde no absorbe las peticiones.

**Deuda técnica.** El AWD exige mantener dos plantillas y dos hojas de estilo. En este mismo proyecto la vista
móvil ya divergió: no incluye los filtros que sí tiene el RWD. También depende de la detección por User-Agent, que
es frágil con dispositivos nuevos, tablets o navegadores que reducen la información del User-Agent, y obliga a una
matriz de pruebas más grande. Para SEO, Google indexa primero la versión móvil, por lo que ambas versiones deben
mantener el mismo contenido.

## 4. Recomendación

**Recomiendo RWD como base** para este catálogo y para la mayoría de los casos: un solo código, una sola clave de
caché, menos deuda técnica y rendimiento comparable en LCP y CLS.

**Recomiendo AWD cuando se cumplan varias de estas condiciones:**

1. **Audiencia móvil masiva con dispositivos y redes limitadas** (por ejemplo, mercados con datos caros y
   teléfonos de gama baja), donde cada kilobyte y cada milisegundo de CPU afectan la conversión.
2. **El móvil y el escritorio son experiencias distintas** (otro flujo de compra, otras funciones), de modo que dos
   plantillas no duplican esfuerzo sino que reflejan dos productos.
3. **Volumen de tráfico donde el egreso sí pese en el presupuesto**, con un CDN capaz de usar la clase de
   dispositivo como clave de caché.
4. **Un equipo con capacidad para mantener y probar dos vistas** sin que diverjan.

Un término medio razonable es un **RWD con componentes pesados condicionales en servidor**: un único layout fluido
y el servidor omite solo lo costoso (gráfico y tabla) en móvil.

## 5. Limitaciones

Pruebas en un servidor local sin compresión ni CDN, con una sola página de 12 productos, en un solo equipo y con
un número reducido de corridas. El precio de egreso es un supuesto. Los resultados de LCP dependen de la
herramienta y de la composición de la página, y no se miden costos reales de CPU de servidor.
