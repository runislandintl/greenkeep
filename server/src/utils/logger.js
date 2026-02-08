const winston = require('winston');
const env = require('../config/env');

const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.isDev
      ? winston.format.combine(winston.format.colorize(), winston.format.simple())
      : winston.format.json()
  ),
  defaultMeta: { service: 'greenkeep' },
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;
