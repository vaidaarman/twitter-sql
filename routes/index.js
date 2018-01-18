'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index');

console.log('test');

var joinString = 'select tweets.user_id as user_id, tweets.content as content, tweets.id as id, users.name as name, users.picture_url as picture_url from tweets join users on tweets.user_id=users.id;'

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    //var allTheTweets = tweetBank.list();
//    client.query('SELECT * FROM tweets JOIN users ON tweets.user_id = users.id', 
    client.query(joinString,
    // client.query('SELECT * FROM tweets', 
    function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true});
      // console.log(result)
    });
    
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: allTheTweets,
    //   showForm: true
    // });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);
  router.get('/users/', respondWithAllTweets);

  // single-user page
  var userJoin = joinString + ' WHERE users.name=$1';
  router.get('/users/:username', function(req, res, next){
    // var tweetsForName = tweetBank.find({ name: req.params.username });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsForName,
    //   showForm: true,
    //   username: req.params.username
    // });
    // client.query('select tweets.user_id as user_id, tweets.content as content, tweets.id as id, users.name as name, users.picture_url as picture_url from tweets join users on tweets.user_id=users.id WHERE users.name=$1'
    client.query('select tweets.user_id as user_id, tweets.content as content, tweets.id as id, users.name as name, users.picture_url as picture_url from tweets join users on tweets.user_id=users.id where users.name=$1',
    [req.params.username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      console.log("Users ", tweets);
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true});
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsWithThatId // an array of only one element ;-)
    // });
    // client.query('SELECT tweets.id as id, users.id as userid, users.name as name, tweets.content as content FROM tweets JOIN users ON tweets.user_id = users.id WHERE tweets.id=$1',
    client.query('select tweets.user_id as user_id, tweets.content as content, tweets.id as id, users.name as name, users.picture_url as picture_url from tweets join users on tweets.user_id=users.id WHERE tweets.id=$1',
      [req.params.id], function (err, result) {
      console.log(req.params.id);
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      console.log("Tweets ", tweets);
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true});
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var newTweet = tweetBank.add(req.body.name, req.body.content);
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;

}