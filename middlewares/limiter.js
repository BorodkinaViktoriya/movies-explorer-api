const rateLimit = require('express-rate-limit');

module.exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Превышено число разрешенных запорсов. Подождите 15 минут.',
  standardHeaders: true,
  legacyHeaders: false,
});
