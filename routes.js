var home = require('./controllers/home_controller'),
    tweets = require('./controllers/tweets_controller');

/*
 * GET home page.
 */

module.exports = function(app) {
  app.get('/', home.index);

  app.get('/tweets', tweets.index);

  // CRUD
  app.post('/tweets', tweets.create);
  app.get('/tweets/:id', tweets.show);
  app.put('/tweets/:id', tweets.update);
  app.delete('/tweets/:id', tweets.destroy);
};