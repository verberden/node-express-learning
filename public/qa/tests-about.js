suite('Test for page "About.."', function() {
    test('This page needs to contain reference to contacts page', function() {
        assert($('a[href="/contact"]').length);
    });
});