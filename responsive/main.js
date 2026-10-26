// Menú desplegable de filtros en pantallas pequeñas (sin recargar la página)
var toggle = document.getElementById('filtros-toggle');
var panel = document.getElementById('panel-filtros');

toggle.addEventListener('click', function () {
  var abierto = panel.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(abierto));
});
