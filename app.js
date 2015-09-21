var express = require('express');
var merge = require('merge');
var request = require('request');
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.json());
module.exports = app;

function gmRequest(url, args, callback) {
    args['responseType'] = "JSON"; // Ensure the correct response type, just in case
    request.post({
        url: "http://gmapi.azurewebsites.net/" + url.replace(/^\//g, ''), // remove any leading slashes
        json: args,
        headers: {
            'Content-Type': 'application/json'
        },

    }, callback);
};

app.get('/', function(req, res) {
    res.send('Welcome to the Smartcar API!');
});

app.get('/vehicles', function(req, res) {
    res.send("<h3>Here are the available calls to this API:</h3>\
        <ul>\
        <li>GET /vehicles/:id</li>\
        <li>GET /vehicles/:id/doors</li>\
        <li>GET /vehicles/:id/(fuel|battery)</li>\
        <li>POST /vehicles/:id/engine</li>\
        <ul>");
});

/* GET /vehicles/:id returns the following fields:
{
    vin          <- getVehicleInfoService.data.vin.value
    color        <- getVehicleInfoService.data.color.value
    doorCount    <- getVehicleInfoService.data.{fourDoorSedan|twoDoorCoupe}.value
    driveTrain   <- getVehicleInfoService.data.driveTrain.value
}
*/
app.get('/vehicles/:id', function(req, res) {
    gmRequest('getVehicleInfoService', {
        id: req.params.id
    }, function(error, response, body) {
        if (body.status != 200) {
            res.status(body.status).json({
                error: body.reason
            });
        } else {
            res.json({
                vin: body.data.vin.value,
                color: body.data.color.value,
                doorCount: body.data.fourDoorSedan.value == 'True' ? 4 : 2,
                driveTrain: body.data.driveTrain.value
            });
        }
    });
});

/* GET /vehicles/:id/doors returns
[{
    location    <- getSecurityStatusService.data.doors.values[_].location.value,
    locked      <- getSecurityStatusService.data.doors.values[_].locked.value
}]
*/
app.get('/vehicles/:id/doors', function(req, res) {
    gmRequest('getSecurityStatusService', {
        id: req.params.id
    }, function(error, response, body) {
        if (body.status != 200) {
            res.status(body.status).json({
                error: body.reason
            });
        } else {
            res.json(body.data.doors.values.map(function(door) {
                return {
                    location: door.location.value,
                    locked: door.locked.value == 'True'
                }
            }));
        }
    });
});

/* GET /vehicles/:id/:range(fuel|battery) returns the following fields:
{
    driveTrain <- getVehicleInfoService.data.{range}.value
}
*/
app.get('/vehicles/:id/:range(fuel|battery)', function(req, res) {
    gmRequest('getEnergyService', {
        id: req.params.id
    }, function(error, response, body) {
        if (body.status != 200) {
            res.status(body.status).json({
                error: body.reason
            });
        } else {
            res.json({
                percent: parseFloat(req.params.range == 'fuel' ? body.data.tankLevel.value : body.data.batteryLevel.value)
            });
        }
    });
});

/* POST /vehicles/:id/engine, given the action in the body of the request returns the following fields:
{
    status <- actionEngineService.actionResult.status
}
*/
app.post('/vehicles/:id/engine', function(req, res) {
    if (req.body.action != "START" && req.body.action != "STOP") {
        res.json({
            error: req.body.action + " is not a valid action."
        });
        return;
    }
    gmRequest('actionEngineService', {
        id: req.params.id,
        command: req.body.action == "START" ? "START_VEHICLE" : "STOP_VEHICLE",
    }, function(error, response, body) {
        if (body.status != 200) {
            res.status(body.status).json({
                error: body.reason
            });
        } else {
            res.json({
                status: body.actionResult.status == "EXECUTED" ? "success" : "error"
            });
        }
    });
});

// catch unknown endpoint
app.use(function(req, res) {
    res.status(404).json({
        error: "Sorry, this endpoint doesn't exist."
    });
});

var server = app.listen(3000);