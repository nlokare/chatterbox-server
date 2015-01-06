var messages = require('./messages.js').messages;
var url = require('url');
var _ = require('underscore');
var fs = require('fs');
var Path = require('path');

exports.requestHandler = function(request, response) {

  var headers = defaultCorsHeaders;
  console.log("Serving request type " + request.method + " for url " + request.url);

  var query = url.parse(request.url, true).query;
  var path = url.parse(request.url, true).pathname;

  if(path === "/" || path.indexOf("/client") >= 0){
    app(request, response, path);
  } else {
    if (path !== "/classes/messages" && path !== "/send") {
      response.writeHead(404, headers);
      response.end('Does not exist!');
    } else {
      if (request.method === 'GET' || request.method === 'OPTIONS') {
        getMessages(request, response, headers, query);
      }
      if (request.method === 'POST' || request.method === 'PUT') {
        parsePost(request, response, headers, postMessage);
      }
    }
  }
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var app = function(req, res, filename){
  var file;
  if(filename === "/"){
    file = Path.resolve(__dirname, '..', 'client/index.html');

  } else {
    // filename = filename.slice(1);
    file = Path.resolve(__dirname, '..', filename);
  }
  console.log(file);
  console.log(__dirname);
  fs.readFile(file, 'binary', function(error, content) {
    if (error) {
      res.writeHead(500);
      res.end();
    }
    else {
      res.writeHead(200, { 'Content-Lenth': content.length });
      res.end(content);
    }
  });
};


var getMessages = function (request, response, headers, query) {
  headers['dataType'] = 'json';
  var roomname = query['where[roomname]'] || 'default';
  var results = [];
  if(roomname === 'default'){
    _.each(messages, function (value) {
      results.push(value);
    });
  } else {
    _.each(messages, function (value) {
      if(value['roomname'] === roomname){
        results.push(value);
      }
    });
  }
  var data = {'results': results};
  response.writeHead(200, headers);
  response.write(JSON.stringify(data), 'utf8');
  response.end();
};

var parsePost = function (req, res, headers, callback) {
  headers['Content-Type'] = "text/plain";
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
  var data = JSON.parse(data);
  var username = data['username'];
  var text = data['text'];
  var roomname = data['roomname'] || 'lobby';
  var date = new Date();
  messages[Object.keys(messages).length + 1] = {'createdAt' : date, 'username': username, 'text': text, 'roomname': roomname};
};

