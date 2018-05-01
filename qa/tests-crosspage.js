var Browser = require('zombie');
var assert = require('chai').assert;

var browser;

suite('Crosspage Tests', function() {

	setup(function(){
		browser = new Browser();
	});

	test('request price for group from page Enisey-river should fill referrers field', function(done){
		var referrer = 'http://localhost:3000/tours/enisey-river';
		browser.visit(referrer, function(){
			browser.clickLink('.requestGroupRate', function(){
				browser.assert.element('form input[name=referrer]', referrer);
				done();
			});
		});
	});

	test('request price for group from page Bobroviy-log should fill referrers field', function(done){
		var referrer = 'http://localhost:3000/tours/bobroviy-log';
		browser.visit(referrer, function(){
			browser.clickLink('.requestGroupRate', function(){				
				browser.assert.element('form input[name=referrer]', referrer);
				done();
			});
		});
	});

	test('Withot refferer going on page Request group rate should NOT fill referrers field. It should be empty', function(done){
		browser.visit('http://localhost:3000/tours/request-group-rate', function(){			
			browser.assert.element('form input[name=referrer]', '');
			done();
		});
	});
});