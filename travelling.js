var express = require('express');
var path = require('path');
var credentials = require('./credentials');
var Vacation = require('./models/vacation.js');
var VacationInSeasonListener = require('./models/vacationInSeasonListener.js');
Vacation.find(function(err, vacations) {
    if(err) return console.error(err);
    if (vacations.length) return;

    new Vacation({
        name: 'One day river Kacha tour',
        slug: 'kacha-river-day-trip',
        category: 'one day trip',
        sku: 'KR199',
        description: 'Spend a day on trvelling by Kachc river. Be wild!',
        priceInCents: 9995,
        tags: ['one day trip', 'kacha river', 'wild'],
        inSeason: true,
        maximumGuests: 16,
        available: true,
        packagesSold: 0,
    }).save();

    new Vacation({
        name: 'Relaxing near Eniseisk',
        slug: 'eniseisk-bank-relax',
        category: 'weekend trip',
        sku: 'ER39',
        description: 'Wonderfulle riverbank and fresh air!',
        priceInCents: 269995,
        tags: ['weekend trip', 'eniseisk', 'relax'],
        inSeason: false,
        maximumGuests: 8,
        available: true,
        packagesSold: 0,
    }).save();

    new Vacation({
        name: 'Sayani rock climbing',
        slug: 'sayani-rock-climbing',
        category: 'adventure',
        sku: 'S99',
        description: 'Try yourself mountain climbing.',
        priceInCents: 289995,
        tags: ['climbing', 'sayani', 'weekend trip'],
        inSeason: true,
        requireWaiver: true,
        maximumGuests: 4,
        available: false,
        packagesSold: 0,
        notes: 'Guide on this tour is recovering from injury now.',
    }).save();
})
var nodemailer = require('nodemailer');
var mailTransport = nodemailer.createTransport("smtps://"+credentials.gmail.user+"%40gmail.com:"+encodeURIComponent(credentials.gmail.password) + "@smtp.gmail.com:465");
    /*'SMTP', {
    service: 'Gmail',
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password,
    }
});*/

var fortune = require('./lib/fortune.js');
var formidable = require('formidable');
var jqupload =require('jquery-file-upload-middleware');
var mongoose = require('mongoose');
var opts = {
    server: {
        socketOptions: {keepAlive: 1 }
    }
};
var app = express();
var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo[app.get('env')].connectionString });

app.use(require('cookie-parser')(credentials.coockieSecret));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.coockieSecret,
    store: sessionStore,
}));

switch(app.get('env')) {
    case 'development': 
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error('Unknown envinromemt: ' + app.get('env'));
}
//var VALID_EMAIL_REGEX = new RegExp('^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public'))); //where to search static files such as .js etc

app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

app.use(require('body-parser').urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/sendemail', function(req, res) {
    mailTransport.sendMail({
        from: '"SN" <endoffme@gmail.com>',
        to: 'cergiy@yandex.ru',
        subject: 'Your tour by Enisey river',
        text: 'Thank you for your reservation in our firm.' + 
                'We are glad to seeyou soon!',
    }, function(err) {
        if(err) console.error('Cannot send the email: ' +err);
    })

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

/*app.post('/newsletter', function(req, res) {
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
});*/

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

var dataDir = __dirname + '/data';
var vacationPhotoDir = dataDir + '/vacation-photo';
var fs = require('fs');
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName, email, year, month, photoPath) {
    // TODO
};

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
        if (err) {
            res.sessoin.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'There was an error while processing form you have send. Please, try again.'
            };
            return res.redirect(303, '/contest/vacation-photo');
        }
        var photo = files.photo;
        var dir = vacationPhotoDir + '/' + Date.now();
        var path = dir + '/' + photo.name;
        fs.mkdirSync(dir);
        fs.renameSync(photo.path, dir + '/' + photo.name);
        saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
        req.session.flash ={
            type: 'success',
            intro: 'Good luck!',
            message: 'You have become the participant of our contest.'
        };
        res.redirect(303, '/contest/vacation-photo/entries'); 
    });
});

app.get('/contest/vacation-photo/entries', function(req, res){
	res.render('contest/vacation-photo/entries');
});

app.get('/vacation/:vacation', function(req, res, next){
	Vacation.findOne({ slug: req.params.vacation }, function(err, vacation){
		if(err) return next(err);
		if(!vacation) return next();
		res.render('vacation', { vacation: vacation });
	});
});

app.get('/set-currency/:currency', function(req, res) {
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vacations')
})

function convertFromUSD(value, currency){
    switch(currency){
    	case 'USD': return value * 1;
        case 'GBP': return value * 0.6;
        case 'BTC': return value * 0.0023707918444761;
        default: return NaN;
    }
}

app.get('/vacations', function(req, res){
    Vacation.find({ available: true }, function(err, vacations){
    	var currency = req.session.currency || 'USD';
        var context = {
            currency: currency,
            vacations: vacations.map(function(vacation){
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    inSeason: vacation.inSeason,
                    price: convertFromUSD(vacation.priceInCents/100, currency),
                    qty: vacation.qty,
                };
            })
        };
        switch(currency){
	    	case 'USD': context.currencyUSD = 'selected'; break;
	        case 'GBP': context.currencyGBP = 'selected'; break;
	        case 'BTC': context.currencyBTC = 'selected'; break;
        }
        res.render('vacations', context);
    });
});

app.post('/vacations', function(req, res){
    Vacation.findOne({ sku: req.body.purchaseSku }, function(err, vacation){
        if(err || !vacation) {
            req.session.flash = {
                type: 'warning',
                intro: 'Ooops!',
                message: 'Something went wrong with your reservation; ' +
                    'please <a href="/contact">contact us</a>.',
            };
            return res.redirect(303, '/vacations');
        }
        vacation.packagesSold++;
        vacation.save();
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'Your vacation has been booked.',
        };
        res.redirect(303, '/vacations');
    });
});

var cartValidation = require('./lib/cartValidation.js');

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.get('/cart/add', function(req, res, next){
	var cart = req.session.cart || (req.session.cart = { items: [] });
	Vacation.findOne({ sku: req.query.sku }, function(err, vacation){
		if(err) return next(err);
		if(!vacation) return next(new Error('Unknown vacation SKU: ' + req.query.sku));
		cart.items.push({
			vacation: vacation,
			guests: req.body.guests || 1,
		});
		res.redirect(303, '/cart');
	});
});
app.post('/cart/add', function(req, res, next){
	var cart = req.session.cart || (req.session.cart = { items: [] });
	Vacation.findOne({ sku: req.body.sku }, function(err, vacation){
		if(err) return next(err);
		if(!vacation) return next(new Error('Unknown vacation SKU: ' + req.body.sku));
		cart.items.push({
			vacation: vacation,
			guests: req.body.guests || 1,
		});
		res.redirect(303, '/cart');
	});
});
app.get('/cart', function(req, res, next){
    var cart = req.session.cart;
    console.log(cart);
	if(!cart) next();
	res.render('cart', { cart: cart });
});
app.get('/cart/checkout', function(req, res, next){
	var cart = req.session.cart;
	if(!cart) next();
	res.render('cart-checkout');
});
app.get('/cart/thank-you', function(req, res){
	res.render('cart-thank-you', { cart: req.session.cart });
});
app.get('/email/cart/thank-you', function(req, res){
	res.render('email/cart-thank-you', { cart: req.session.cart, layout: null });
});
app.post('/cart/checkout', function(req, res){
	var cart = req.session.cart;
	if(!cart) next(new Error('Cart does not exist.'));
	var name = req.body.name || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) return res.next(new Error('Invalid email address.'));
	// assign a random cart ID; normally we would use a database ID here
	cart.number = Math.random().toString().replace(/^0\.0*/, '');
	cart.billing = {
		name: name,
		email: email,
	};
    res.render('email/cart-thank-you', 
    	{ layout: null, cart: cart }, function(err,html){
	        if( err ) console.log('error in email template');
	        emailService.send(cart.billing.email,
	        	'Thank you for booking your trip with Meadowlark Travel!',
	        	html);
	    }
    );
    res.render('cart-thank-you', { cart: cart });
});

app.get('/notify-me-when-in-season', function(req, res) {
    VacationInSeasonListener.update(
        { email: req.body.email },
        { $push: { skus : req.body.sku } },
        { upsert: true },
        function(err) {
            if (err) {
                console.log(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'An error occurred while processing the request.'
                };
                return res.redirect(303, '/vacations');
            }
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'You will be notified when the season comes for this tour.'
            };
            return res.redirect(303, '/vacations');
        }
    );
});

app.post('/notify-me-when-in-season', function(req, res){
    VacationInSeasonListener.update(
        { email: req.body.email }, 
        { $push: { skus: req.body.sku } },
        { upsert: true },
	    function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, '/vacations');
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'You will be notified when this vacation is in season.',
	        };
	        return res.redirect(303, '/vacations');
	    }
	);
});

app.get('/set-currency/:currency', function(req,res){
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vacations');
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

var Attraction = require('./models/attraction.js');

var apiOptions = {
    context: '/',
    domain: require('domain').create(),
};
var bodyParser = require('body-parser');
var vhost = require('vhost');
var Rest = require('connect-rest');
app.use( bodyParser.urlencoded( { extended: true } ) ).use( bodyParser.json() );

var rest = Rest.create(apiOptions);
app.use(vhost('api.*',rest.processRequest()));
rest.get('attractions', async function(req, content){
    await Attraction.find({ approved: true }, function(err, attractions){
        if(err) return { error: 'Internal error.' };
        if (attractions.length < 1) {
        } else {
            attractions.map(function(a){
                console.log(a);
                return {
                    name: a.name,
                    description: a.description,
                    location: a.location,
                };
            });
        }
    });
});

rest.post('attraction', async function(req, content){
    var a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date(),
        },
        approved: false,
    });
    await a.save(function(err, a){
        if(err) return { error: 'Unable to add attraction.' };
    });

    return {id: a._id};
});

rest.get('attraction/:id', async function(req, content){
    let name, description, location;
    await Attraction.findById(req.params.id, function(err, a){
        if(err) return { error: 'Unable to retrieve attraction.' };
        ({ name, description, location } = a);
    });
    return { 
        name,
        description,
        location,
    };
});

app.use(function (req, res) {
    res.status(404);
    res.render('404', {
        fortune: fortune.getFortune() 
    });
});

app.use( function(req, res, next){
	if(req.session)
		req.session.destroy()
	// render error page by some renderer...
	renderer.render( 'error', {}, function(err, html){
		res.writeHead( 500, { 'Content-Type' : 'text/html' } )
		res.end( html );
	} )
} );

/*app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500);
    res.render('500');
});*/

app.listen(app.get('port'), function() {
    console.log('Express started at http://localhost:' +
                app.get('port') + '; press Ctrl+C to close.');
});