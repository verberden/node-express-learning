var fortunes = [
    'Сегодня Вам не повезло',
    'Возможно, сегодня не Ваш день',
    'Может быть Вам необходим отдых?',
    'Упс.. Вероятно Вы ошиблись!'
];

exports.getFortune = function() {
    var idx = Math.floor(Math.random() * fortunes.length);
    return fortunes[idx];
};
