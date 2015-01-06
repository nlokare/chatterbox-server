var Message = Backbone.Model.extend({
  url: 'http://127.0.0.1:3000/classes/messages',
  defaults: {
    roomname: 'HackReactor'
  }
});

var Messages = Backbone.Collection.extend({
  model: Message,
  url: 'http://127.0.0.1:3000/classes/messages',

  loadMessages: function () {
    this.fetch({data: {order: '-createdAt', where: {'roomname': 'HackReactor'}}});
  },

  parse: function (response) {
    var messages = response.results;
    var results = [];
    for (var i = messages.length-1; i > 0; i--) {
      results.push(messages[i]);
    }
    return results;
  }

});

var FormView = Backbone.View.extend({

  events: {
    'click #send': 'handleSubmit'
  },

  handleSubmit: function (e) {
    e.preventDefault();
    var $text = this.$('#message');

    this.collection.create({
      username: window.location.search.split('=')[1],
      text: $text.val(),
      roomname: 'HackReactor'
    });
    $text.val('');
  }

});

var MessageView = Backbone.View.extend({
  template: _.template("<li class='list-group-item'><strong class='username'> \
                        <%- username %></strong>: <%- text %></li>"),
  render: function () {
    this.$el.html(this.template(this.model.attributes));
    return this.$el;
  }
});

var MessagesView = Backbone.View.extend({
  initialize: function() {
    this.collection.on('sync', this.render, this);
  },

  render: function() {
    this.collection.forEach(this.renderMessage, this);
  },

  renderMessage: function (message) {
    var messageView = new MessageView({model: message});
    this.$el.prepend(messageView.render());
  }

});

/*

var RoomsView = Backbone.View.extend({
  initialize: function() {
    this.collection.on('sync', this.render, this);
  },

  render: function() {
    this.collection.forEach(this.renderRooms, this);
  },

  renderRooms: function (room) {
    var roomView = new RoomView({model: room});
    this.$el.append(roomView.render());
  }

});
*/
