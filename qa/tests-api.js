var assert = require('chai').assert;
var http = require('http');
var rest = require('restling');

suite('API tests', function() {
    var attraction = {
        lat: 45.516011,
        lng: -122.682062,
        name: 'Portland Art Museum',
        description: 'Founded in 1892, the Portland Art Museum\'s colleciton ' +
            'of native art is not to be missed.  If modern art is more to your ' +
            'liking, there are six stories of modern art for your enjoyment.',
        email: 'test@meadowlarktravel.com',
    };
    var base = 'http://api.localhost:3000';

    var successCallback = function(result){
        console.log('Data: ' + result.data);
        console.log('Response: ' + result.response);
        };
         
        var errorCallback = function(error){
          console.log('Error: ' + error.message);
          if (error.response) {
            console.log('Response: ' + error.response);
          }
        };

    test('should be able to add an attraction', 
        function(done){
        rest.post(base + '/attraction', { data:attraction }).then(function(result) {
            if (result.response.statusCode == 200) {
                assert.match(result.data.id, /\w/, 'd must be set');
                done();
            };
          },
          errorCallback
        )
    });

    test('should be able to retrieve an attraction', 
        function(done){
         rest.post(base + '/attraction', { data:attraction }).then(
         function(result) {
                if (result.response.statusCode == 200) {
                rest.get(base + '/attraction/' + result.data.id).then(function(result) {
                    if (result.response.statusCode == 200) {
                        console.log(result)
					    assert(result.data.name===attraction.name);
                        assert(result.data.description===attraction.description);
                        done();
                    }
                },
                errorCallback);
                };
            },
        errorCallback
        );
    });
});