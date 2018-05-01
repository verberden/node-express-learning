suite('Global Tests', function() {
    test('Tis page has acceptable title', function() {
        assert(document.title && document.title.match(/\S/) &&
        document.title.toUpperCase() !== 'TODO');
    });
});