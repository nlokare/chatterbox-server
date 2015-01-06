var messages;// = require('./messages.js').messages;
var url = require('url');
var _ = require('underscore');
var fs = require('fs');
var Path = require('path');
var isInit = false;

exports.requestHandler = function (request, response) {
  if(!isInit){
    initialize();
    isInit = true;
  }

  var headers = defaultCorsHeaders;
  console.log("Serving request type " + request.method + " for url " + request.url);

  var query = url.parse(request.url, true).query;
  var path = url.parse(request.url, true).pathname;

  if(path === "/" || path.indexOf("client") >= 0) {
    app(request, response, path); //serve index.html from '/'
  } else {
    if ((request.method === 'GET' || request.method === 'OPTIONS') && path === '/messages') {
      getMessages(request, response, headers, query);
    }
    if ((request.method === 'POST' || request.method === 'PUT') && path === '/send') {
      parsePost(request, response, headers, postMessage);
    } else {
      response.writeHead(404, headers);
      response.end("Does not exist");
    }
  }
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var app = function (request, response, filename){
  var file;

  if(filename === "/"){
    file = Path.resolve(__dirname, '..', 'client/index.html');
  } else {
    file = Path.resolve(__dirname, '..') + filename;
  }

  fs.readFile(file, 'binary', function (error, content) {
    if (error) {
      response.writeHead(500);
      response.end();
    }
    else {
      response.writeHead(200, { 'Content-Lenth': content.length });
      response.end(content);
    }
  });
};

var initialize = function(){
  messages = JSON.parse(fs.readFileSync('messages.txt'));
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

var parsePost = function (request, response, headers, callback) {
  headers['Content-Type'] = "text/plain";
  var data = '';
  request.on('data', function(chunk) {
    data += chunk;
  });
  request.on('end', function() {
    response.writeHead(201, headers);
    response.end();
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
  fs.writeFile('messages.txt', JSON.stringify(messages), 'utf8', function (err) {
    if (err) {
      console.log("did not write");
    } else {
      console.log("Messages stored to file");
    }
  });
};

