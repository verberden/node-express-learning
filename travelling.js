var express = require('express');
var path = require('path');

var credentials = require('./credentials');
var fortune = require('./lib/fortune.js');
var formidable = require('formidable');
var jqupload =require('jquery-file-upload-middleware');

var app = express();

var VALID_EMAIL_REGEX = new RegExp('^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public'))); //where to search static files such as .js etc



app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

app.use(require('cookie-parser')(credentials.coockieSecret));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.coockieSecret,
}));

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

app.post('/newsletter', function(req, res) {
    var name = req.body.name || '', email = req.body.email ||'';

    if(!email.match(VALID_EMAIL_REGEX)) {
        if(req.xhr)
            return res.json({
                error: 'Incorrect email address.'
            });
        
        req.session.flash = {
            type: 'danger',
            intro: 'Match error!',
            message: 'Email address you have written is incorrect.'
        };

        return res.redirect(303, '/newsletter/archive');

    }
    new NewsletterSignup({name: name, email: email}).save(function(err) {
        if (err) {
            if(req.xhr)
                return res.json({
                    error: 'Database error.'
                });
        
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'Database error occure. Please, try again later.'
            };
            
            return res.redirect(303, '/newsletter/archive');
        }

        if (req.xhr)
            return res.json({
                success: true
            });

        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have been subscribed.'
        };
        
        return res.redirect(303, '/newsletter/archive');
    })
});

app.get('/newsletter/archive', function(req, res) {
    res.render('newsletter/archive', {flash: req.session.flash});
});

app.post('/process', function(req, res) {
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CDSF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);

    if(req.xhr || req.accepts('json,html')==='json') {
        res.send({ success: true });
    } else {
        res.redirect(303, '/thank-you');
    }
});

app.get('/thank-you', function(req, res) {
    res.render('thank-you');
});

app.get('/contest/vacation-photo', function(req, res) {
    var now = new Date();
    req.session.userName = 'Anonymus';
    res.cookie('signed_mycookie', 'nom nom', { signed: true });
    res.render('contest/vacation-photo', { 
        year: now.getFullYear(), month: now.getMonth()
    });
    console.log(req.signedCookies.signed_mycookie);
});

app.get('/contest/vacation-photo-jq', function(req, res) {
    console.log(req.session.userName);
    res.render('contest/vacation-photo-jq');
});

app.post('/contest/vacation-photo/:year/:month', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if (err) return res.redirect(303, '/error');
        console.log('recieved fields: ');
        console.log(fields);
        console.log('recieved files: ');
        console.log(files);
        res.redirect(303, '/thank-you'); 
    });
});

app.use('/upload', function(req, res, next) {
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function() {
            return __dirname + '/public/uploads' + now;
        },
        uploadUrl: function() {
            return '/uploads/' + now;
        }
    })(req, res, next);
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