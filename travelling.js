var express = require('express');
var path = require('path');

let app = express();

let fortunes = [
    'Сегодня Вам не повезло',
    'Возможно, сегодня не Ваш день',
    'Может быть Вам необходим отдых?',
    'Упс.. Вероятно Вы ошиблись!'
]

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/about', function(req, res) {
    res.render('about');
});

app.use(function (req, res) {
    let randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.status(404);
    res.render('404', {fortune: randomFortune});
});

app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started at http://localhost:' +
                app.get('port') + '; press Ctrl+C to close.')
});