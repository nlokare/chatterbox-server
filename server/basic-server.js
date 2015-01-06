var http = require("http");
var handleRequest = require('./request-handler.js').requestHandler;

var server = http.createServer(handleRequest);
console.log("Listening on http://127.0.0.1:3000");
server.listen(3000, "127.0.0.1");

