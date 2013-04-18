App = Ember.Application.create();

// Models

App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.RESTAdapter.extend({
    url: 'http://localhost:4567'
  })
});

App.Post = DS.Model.extend({
  title: DS.attr('string'),
  author: DS.attr('string'),
  intro: DS.attr('string'),
  extended: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date')
});


// Router

App.Router.map(function() {
  this.resource('posts', function() {
    this.resource('post', { path: ':post_id' });
    this.route('new');
  });
});


// Routes

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('posts');
  }
});

App.PostsRoute = Ember.Route.extend({
  model: function() {
    return App.Post.find();
  }
});

App.PostsNewRoute = Ember.Route.extend({
  model: function() {
    return App.Post.createRecord();
  }
});


// Controllers

App.PostController = Ember.ObjectController.extend({
  isEditing: false,

  cancelEditing: function() {
    var post = this.get('model');

    if (post.get('isDirty')) {
      post.rollback();
    }

    this.set('isEditing', false);
  },

  doneEditing: function() {
    var post = this.get('model'),
        controller = this;

    if (!post.get('isDirty')) {
      controller.set('isEditing', false);
      return
    }

    post.on('didUpdate', function() {
      controller.set('isEditing', false);
    });

    this.get('store').commit();
  },

  edit: function() {
    this.set('isEditing', true);
  },

  delete: function() {
    var post = this.get('model'),
        controller = this;

    post.deleteRecord();

    post.on('didDelete', function() {
      controller.transitionToRoute('posts');
    });

    this.get('store').commit();
  }
});

App.PostsNewController = Ember.ObjectController.extend({
  save: function() {
    var post = this.get('model'),
        controller = this;

    post.on('didCreate', function() {
      // Wait for the id
      setTimeout(function() {
        controller.transitionToRoute('post', post);
      }, 10);
    });

    this.get('store').commit();
  }
});


// Helpers

Ember.Handlebars.registerBoundHelper('date', function(date) {
  return moment(date).fromNow();
});

var showdown = new Showdown.converter();

Ember.Handlebars.registerBoundHelper('markdown', function(input) {
  return new Ember.Handlebars.SafeString(showdown.makeHtml(input));
});
