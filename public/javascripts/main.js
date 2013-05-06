(function($) {
    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
    };

    Backbone.Model.prototype.idAttribute = '_id';

    var tweetsView, tweetDetailsView;

    var Tweet = Backbone.Model.extend({
      defaults: function() {
        return {
          author: '',
          status: ''
        }
      }
    });
    var TweetsList = Backbone.Collection.extend({
      model: Tweet,
      url: '/tweets'
    });
    var tweets = new TweetsList();

    var TweetView = Backbone.View.extend({
      model: new Tweet(),
      tagName: 'div',
      events: {
        'click .edit': 'edit',
        'click .delete': 'delete',
        'click .details': 'details',
        'blur .status': 'close',
        'keypress .status': 'onEnterUpdate'
      },
      initialize: function() {
        this.template = _.template($('#tweet-template').html());
      },
      edit: function(ev) {
        ev.preventDefault();
        this.$('.status').attr('contenteditable', true).focus();
      },
      details: function(ev) {
        var target = $(ev.currentTarget);
        ev.preventDefault();
        router.navigate(target.attr('href'), {trigger: true});
      },
      close: function(ev) {
        var status = this.$('.status').text();
        var self = this;
        this.model.save({status: status}, {
            success: function() { console.log("successfully updated tweet " + self.model.id )},
            error: function() { console.log("Failed to update tweet with id=" + self.model.id );}
        });
        this.$('.status').removeAttr('contenteditable');
      },
      onEnterUpdate: function(ev) {
        var self = this;
        if (ev.keyCode === 13) {
          this.close();
          _.delay(function() { self.$('.status').blur() }, 100);
        }
      },
      delete: function(ev) {
        var self = this;
        ev.preventDefault();
        this.model.destroy({
            success: function() { tweets.remove(this.model); },
            error: function() { console.log("Failed to remove tweet with id=" + self.model.id ); }
        });
      },
      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      }
    });

    var TweetsView = Backbone.View.extend({
      model: tweets,
      el: $('#tweets-container'),
      initialize: function() {
        var self = this;
        this.model.on('add', this.render, this);
        this.model.on('remove', this.render, this);

        tweets.fetch({
          success: function() { self.render(); },
          error: function() { console.log('Cannot retrive models from server'); }
        });
      },
      render: function() {
        var self = this;
        self.$el.html('');
        _.each(this.model.toArray(), function(tweet, i) {
          self.$el.append((new TweetView({model: tweet})).render().$el);
        });
        return this;
      },
      hide: function() {
        this.$el.hide();
      },
      show: function() {
        this.$el.show();
      }
    });

    var TweetDetailsView = Backbone.View.extend({
      el: $('#tweet-details'),
      initialize: function() {
        this.template = _.template($('#tweet-details-template').html());
      },
      hide: function() {
        this.$el.hide();
      },
      show: function(model) {
        this.model = model;
        this.render();
      },
      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      }
    });

    var Router = Backbone.Router.extend({
        routes: {
            '': 'index',
            'tweets/:id': 'show'
        },
        index: function() {
            tweetDetailsView.hide();
            tweetsView.show();
        },
        show: function(id) {
            model = tweets.where({_id: id});
            tweetDetailsView.show(model);
            tweetsView.hide();
        }
    });

    window.router = new Router();

    $(document).ready(function() {
      $('#new-tweet').submit(function(ev) {
        var tweet = new Tweet({ author: $('#author-name').val(), status: $('#status-update').val() });
        tweets.add(tweet);
        console.log(tweets.toJSON());
        tweet.save({}, {
          success: function() { console.log("successfully saved tweet!"); },
          error: function() { console.log("Error saving tweet!"); }
        });
        
        return false;
      });
      
      tweetsView = new TweetsView();
      tweetDetailsView = new TweetDetailsView();

      Backbone.history.start();
    });
    
})(jQuery);