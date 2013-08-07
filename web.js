var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());

var tpl_file = 'index.html';

app.get('/', function(request, response) {
	var tpl = fs.readFileSync(tpl_file).toString();
	response.send(tpl);
});

var favicon = fs.readFileSync('favicon.ico');
app.get('/favicon.ico', function(request, response) {
	response.setHeader("Content-Type", "image/x-icon");
	response.send(favicon);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
