var express = require('express');
var path = require('path');

var fortune = require('./lib/fortune.js');

var app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

app.use(require('body-parser').urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/about', function(req, res) {
    res.render('about', {
        pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/tours/enisey-river', function(req, res) {
    res.render('tours/enisey-river');
});

app.get('/tours/bobroviy-log', function(req, res) {
    res.render('tours/bobroviy-log');
});

app.get('/tours/request-group-rate', function(req, res) {
    res.render('tours/request-group-rate');
});

app.get('/newsletter', function(req, res) {
    res.render('newsletter', {csrf: 'CSRF token goes here'});
});

app.post('/process', function(req, res) {
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CDSF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);

    if(req.xhr || req.accepts('json,html')==='json') {
        res.send({ success: true });
    } else {
        res.redirect(303, '/thank-you')
    }

    
})

app.get('/thank-you', function(req, res) {
    res.render('thank-you');
});

app.use(function (req, res) {
    res.status(404);
    res.render('404', {
        fortune: fortune.getFortune() 
    });
});

app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started at http://localhost:' +
                app.get('port') + '; press Ctrl+C to close.');
});