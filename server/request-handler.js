var messages = require('./messages.js').messages;
var url = require('url');
var _ = require('underscore');

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such ands
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
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
      headers['Content-Type'] = "application/json";
      parsePost(request, postMessage);
      response.writeHead(201, headers);
      response.end();
      console.log("message successfully added");
    }
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
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

var parsePost = function (req, callback) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
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
  messages[messages.length + 1] = {'createdAt' : date, 'username': username, 'text': text, 'roomname': roomname};
};

