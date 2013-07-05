var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());

var tpl_file = 'index.html';

app.get('/', function(request, response) {
  
	var tpl = fs.readFileSync(tpl_file).toString();
	response.send(tpl);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
