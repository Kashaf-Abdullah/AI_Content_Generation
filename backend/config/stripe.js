const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
module.exports.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
