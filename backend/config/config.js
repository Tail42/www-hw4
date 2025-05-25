require('dotenv').config();

module.exports = {
  fatSecret: {
    consumerKey: process.env.FATSECRET_CONSUMER_KEY,
    consumerSecret: process.env.FATSECRET_CONSUMER_SECRET,
    apiUrl: 'https://platform.fatsecret.com/rest/server.api'
  }
};