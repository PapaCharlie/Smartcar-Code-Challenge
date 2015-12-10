var test = require('tape');
var request = require('supertest');
var app = require('./app');

var car1234 = {
    vin: "123123412412",
    color: "Metallic Silver",
    doorCount: 4,
    driveTrain: "v8"
};

var car1235 = {
    vin: "1235AZ91XP",
    color: "Forest Green",
    doorCount: 2,
    driveTrain: "electric"
};


test('Invalid id handled correctly (404)', function(t) {
    request(app)
        .get('/vehicles/4321')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(function(err, res) {
            t.error(err, 'No error');

            var notFound = res.body.hasOwnProperty('error') && res.status == 404;
            t.ok(notFound, '404 on invalid id');
            t.end();
        });
});

test('Valid id returns all required fields', function(t) {
    request(app)
        .get('/vehicles/1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            t.deepEquals(res.body, car1234, 'Info API returns expected car attributes.');
        });
    request(app)
        .get('/vehicles/1235')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            t.deepEquals(res.body, car1235, 'Info API returns expected car attributes.');
            t.end();
        });
});

test('Right set of doors is returned', function(t) {
    request(app)
        .get('/vehicles/1234/doors')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            // Doors can be opened or closed at any time, therefore can only test for attributes
            // Both tests only pass if both frontRight and frontLeft are present
            t.ok(res.body[0].location == 'frontLeft' || res.body[1].location == 'frontLeft', 'Car has frontLeft door');
            t.ok(res.body[0].location == 'frontRight' || res.body[1].location == 'frontRight', 'Car has frontRight door');
            t.equals(typeof res.body[0].locked, 'boolean', 'Door locked status is a boolean');
            t.equals(typeof res.body[1].locked, 'boolean', 'Door locked status is a boolean');
        });
    request(app)
        .get('/vehicles/1235/doors')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            t.ok(res.body[0].location == 'frontLeft' || res.body[1].location == 'frontLeft', 'Car has frontLeft door');
            t.ok(res.body[0].location == 'frontRight' || res.body[1].location == 'frontRight', 'Car has frontRight door');
            t.equals(typeof res.body[0].locked, 'boolean', 'Door locked status is a boolean');
            t.equals(typeof res.body[1].locked, 'boolean', 'Door locked status is a boolean');

            t.end();
        });
});

test('Fuel level is returned properly for car 1234', function(t) {
    request(app)
        .get('/vehicles/1234/fuel')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            t.ok(res.body.hasOwnProperty('percent'), 'API returns fuel percentage'); // percent is variable here, cannot test
            t.equals(typeof res.body.percent, 'number', 'API returns fuel percentage'); // can only test for type and existence
        });
    request(app)
        .get('/vehicles/1234/battery')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            t.ok(res.body.percent == null, 'API returns NaN when battery is called on gas-powered car');
            t.end();
        });
});

test('Battery level is returned properly for car 1235', function(t) {
    request(app)
        .get('/vehicles/1235/battery')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            t.ok(res.body.hasOwnProperty('percent'), 'API returns battery percentage');
            t.equals(typeof res.body.percent, 'number', 'API returns fuel percentage');
        });
    request(app)
        .get('/vehicles/1235/fuel')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            t.ok(res.body.percent == null, 'API returns NaN when fuel is called on electric car');
            t.end();
        });
});

test('Start|Stop engine returns correct attribute', function(t) {
    request(app)
        .post('/vehicles/1234/engine')
        .send({
            action: 'START'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            // Start and Stop seem to have a small chance of failing on either car, so check only for correct attributes
            t.ok(res.body.hasOwnProperty('status'), 'API return error message');
            t.equals(typeof res.body.status, 'string', 'Engine (start|stop) status is a string');
        });

    request(app)
        .post('/vehicles/1234/engine')
        .send({
            action: 'STOP'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            t.error(err, 'No error');

            t.ok(res.body.hasOwnProperty('status'), 'API return error message');
            t.equals(typeof res.body.status, 'string', 'Engine (start|stop) status is a string');
            t.end();
        });
});