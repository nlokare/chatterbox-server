var app = {};
app.room = 'HackReactor';
app.server = 'http://127.0.0.1:3000/';
app.friends = [];

app.init = function () {
  app.rooms = this.getRooms();
  app.createDropDown(app.rooms);
  this.fetch(app.room);
  setInterval( function() {
    app.fetch(app.room);
    app.createDropDown(app.rooms);
  }, 500);
};

app.fetch = function (room) {
  $.ajax({
    url: app.server + 'messages',
    type: 'GET',
    data: {
      order: "-createdAt",
      where: { "roomname": room }
    },
    success: function (data) {
      var data = JSON.parse(data);
      app.messages = data.results;
    },
    complete: app.displayMessages
  });
};

app.getRooms = function () {
  var rooms = {};
  $.ajax({
    url: app.server + 'messages',
    type: 'GET',
    data: {
      order: "-createdAt",
    },
    success: function (data) {
      var data = JSON.parse(data);
      return roomStorage(data.results);
    }
  });

  var roomStorage = function (data) {

    for (var key in data) {
      var roomName = app.escapeHtml(data[key]['roomname']);

      if (rooms[roomName] === undefined) {
        rooms[roomName] = true;
      }
    }
  };

  return rooms;
};

app.send = function (message) {

  $.ajax({
    url: app.server + 'send',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('Successfully added');
    },
    error: function (data) {
      console.log('Unsuccessful');
    }
  });
};


app.addMessage = function (message) {
  $('#chats').prepend("<li class='list-group-item'>" + "<strong class='username'>" + app.escapeHtml(message.username) + "</strong>: " + app.escapeHtml(message.text)  + "</li>");
};

app.displayMessages = function () {
  app.clearMessages();
  var element;
  for (var i = 0; i < app.messages.length; i++) {
    if (app.messages[i]['username'] !== undefined) {
      if (app.friends.indexOf(app.messages[i]['username']) > -1) {
        element = "<li class='list-group-item friend'>" + "<strong class='username'>" + app.escapeHtml(app.messages[i]['username']) + "</strong>: " + app.escapeHtml(app.messages[i]['text']) + '<span class ="time">' + moment(app.messages[i]['createdAt']).fromNow() + "</span></li>";
      } else {
        element = "<li class='list-group-item'>" + "<strong class='username'>" + app.escapeHtml(app.messages[i]['username']) + "</strong>: " + app.escapeHtml(app.messages[i]['text']) + '<span class ="time">' + moment(app.messages[i]['createdAt']).fromNow() + "</span></li>";
      }
    }
  $('ul#chats').prepend(element);
  }
};

app.createDropDown = function (rooms) {
  $('.newRoom').siblings().empty();
  var roomNames = [];
  var elements = [];
  for (var key in rooms) {
    roomNames.push(key);
  }
  for (var i = 0; i < roomNames.length; i++) {
    elements.push("<li><a href='#' class='roomName'>" + roomNames[i] + "</a></li>");
  }
  //elements[0]
  $("#roomMenu").append(elements.join(''));
};

app.clearMessages = function () {
  $('#chats').empty();
  $('.nav-tabs').empty();
  $('.tab-content ul').empty();
};

app.addRoom = function (room) {
  $('#roomSelect').append('<li>' + room + '</li>');
};

app.escapeHtml = function (string) {
  var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
  };
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
};

app.escapeRoom = function (string) {
  if (string.indexOf(" ") === 1) {
    string.split(' ').join('');
  }
  return string;
};

app.handleSubmit = function () {
  var username = window.username;
  var text = $('#message').val();

  var message = {
    'username' : username,
    'text' : text,
    'roomname' : app.room
  };
  app.send(message);
  $('#message').val('');
};

app.addFriend = function (username) {
  if (app.friends.indexOf(username) === -1) {
    app.friends.push(username);
  }
};

app.init();
