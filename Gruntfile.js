module.exports = function(grunt) {

    [
        'grunt-mocha-test',
        'grunt-contrib-jshint',
        'grunt-exec',
    ].forEach(function(task) {
        grunt.loadNpmTasks(task);
    });

    grunt.initConfig({
        mochaTest: {
            all: {src: 'qa/tests-*.js', options: {ui: 'tdd'}, }
        },
        jshint: {
            app: ['travelling.js', 'public/js/**/*.js', 'lib/**/*.js'],
            qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
        },
        exec: {
            linkchecker:
                {cmd: 'linkcheck http://localhost:' + (grunt.option('port') || '3000')},
        },
    });

    grunt.registerTask('default', ['mochaTest', 'jshint', 'exec']);
};