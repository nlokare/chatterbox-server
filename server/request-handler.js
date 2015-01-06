var messages = require('./messages.js').messages;
var url = require('url');
var _ = require('underscore');

exports.requestHandler = function(request, response) {

  var headers = defaultCorsHeaders;
  console.log("Serving request type " + request.method + " for url " + request.url);

  var query = url.parse(request.url, true).query;
  var path = url.parse(request.url, true).pathname;

  //Handles
  if (path !== "/classes/messages" && path !== "/send" && path !== "/classes/room") {
    response.writeHead(404, headers);
    response.end('Does not exist!');
  } else {
    if (request.method === 'GET' || request.method === 'OPTIONS') {
      headers['dataType'] = 'json';
      var data = getMessages(query);
      response.writeHead(200, headers);
      response.write(JSON.stringify(data), 'utf8');
      response.end();
    }
    if (request.method === 'POST' || request.method === 'PUT') {
      headers['Content-Type'] = "text/plain";
      parsePost(request, response, headers, postMessage);
      console.log("message successfully added");
    }
  }
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var getMessages = function (query) {
  var roomname = query['where[roomname]'];
  var results = [];
  _.each(messages, function (value, key, messages) {
    if(value['roomname'] === roomname){
      results.push(value);
    }
  });
  return {'results': results};
};

var parsePost = function (req, res, headers, callback) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    res.writeHead(201, headers);
    res.end();
    callback(data);
  });
};

var postMessage = function (data) {
  console.log("Post: ", data);
  var data = JSON.parse(data);
  var username = data['username'];
  var text = data['text'];
  var roomname = data['roomname'] || 'lobby';
  var date = new Date();
  messages[Object.keys(messages).length + 1] = {'createdAt' : date, 'username': username, 'text': text, 'roomname': roomname};
};

