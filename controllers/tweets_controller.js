var _ = require('underscore'),
    tweets = require('../db').collections.tweets,
    ObjectId = require('../db').ObjectId;

exports.index = function(req, res) {
  tweets.find().toArray(function(err, docs) {
    if(err) return res.status(500).send({ status: 'Failed to find tweets!'});
    res.send(docs);
  })
};

exports.show = function(req, res) {
    var id = req.params.id;

    tweets.findOne({ _id: new ObjectId(id)}, function(err, tweet) {
        if(err) return res.status(500).send({status: "Failed to find tweet due to database error " + id});
        if(!tweet) return res.status(404).send({status: "Cannot find tweet with id=" + id});

        res.render('tweets/show', tweet);
    });
};

exports.create = function(req, res) {
  var params = req.body;
  tweets.insert(params, function(err) {
    if(err) return res.status(500).send({status: "Failed to write to the server"});
    res.send(params);
  });
};

exports.destroy = function(req, res) {
  var id = req.params.id;
  tweets.remove({ _id: new ObjectId(id)}, function(err, numRemoved) {
    if (err || numRemoved !== 1) return res.status(500).send({status: "Failed to remove delete tweet " + id + " from server"});
    res.send({_id: id});
  });
};

exports.update = function(req, res) {
    var id = req.params.id,
        params = req.body;

    tweets.update({ _id: new ObjectId(id)}, sanitize(params), function(err, numUpdated) {
        if(err || numUpdated !== 1) return res.status(500).send({status: "Failed to updated tweet " + id});
        res.send(params);
    });
};

function sanitize(tweet) {
    var tweet = _.clone(tweet);
    delete tweet._id;
    return tweet;
}