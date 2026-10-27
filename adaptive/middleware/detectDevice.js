// Detecta el tipo de cliente con express-useragent a partir del User-Agent
// y lo deja en req.device ('mobile' | 'tablet' | 'desktop').
// isTablet se evalúa primero porque los iPad y las tablets Android también reportan isMobile.
const { UserAgent } = require('express-useragent');

function detectDevice(req, res, next) {
  const agente = new UserAgent().hydrate(req.headers['user-agent'] || '').Agent;
  if (agente.isTablet) req.device = 'tablet';
  else if (agente.isMobile) req.device = 'mobile';
  else req.device = 'desktop';
  next();
}

module.exports = detectDevice;
