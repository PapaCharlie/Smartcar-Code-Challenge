var express =       require('express');
// var http =          require('http');
// var path =          require('path');

var app = express();
module.exports = app;

// Request mapping wanted:
// GET /vehicles/:id ->


app.get('/', function(req, res) {
    // console.log(req);
    res.send('Hello!');
});

app.get('/vehicles/:id', function(req, res) {
    id = req.params.id;
    res.send(id);
});

// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});