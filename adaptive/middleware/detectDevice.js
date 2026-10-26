// Detecta el tipo de cliente con express-useragent a partir del User-Agent
// y lo deja en req.device ('mobile' | 'desktop').
const { UserAgent } = require('express-useragent');

function detectDevice(req, res, next) {
  const agente = new UserAgent().hydrate(req.headers['user-agent'] || '').Agent;
  req.device = agente.isMobile ? 'mobile' : 'desktop';
  next();
}

module.exports = detectDevice;
