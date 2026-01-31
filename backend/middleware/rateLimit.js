const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis'); // npm i rate-limit-redis ioredis

// IP-based rate limiting (anti-spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: process.env.NODE_ENV === 'production' 
    ? new RedisStore({
        client: require('ioredis')({
          host: process.env.REDIS_URL,
          port: process.env.REDIS_PORT
        })
      })
    : undefined
});

// AI generation specific rate limit (expensive)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 AI calls per minute
  message: {
    error: 'Slow down! Max 10 AI generations per minute.'
  }
});

module.exports = { limiter, aiLimiter };
