var fortune = require('../lib/fortune.js');
var expect = require('chai').expect;

suite('Test for cookies', function() {

    test('getFortune() should return prediction', function() {
        expect(typeof fortune.getFortune() === 'string');
    });
});