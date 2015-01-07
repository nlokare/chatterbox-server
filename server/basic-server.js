var http = require("http");
var port = process.env.PORT || 3000;
var host = process.env.HOST || '127.0.0.1';


var handleRequest = require('./request-handler.js').requestHandler;

var server = http.createServer(handleRequest);
console.log("Listening on http://127.0.0.1:3000");
server.listen(port, host);


