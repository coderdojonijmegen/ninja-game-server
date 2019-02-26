function TestApp() {
    this.socket = io()
}


TestApp.prototype.setName = function setName(name) {
    $('#playerName').text(name)
}


TestApp.prototype.showTaggerText = function showTaggerText(is_tagger) {
    if (is_tagger) {
        $('#taggerText').text('Je bent de tikker').css('color', 'red')
    }
    else {
        $('#taggerText').text('Je bent niet de tikker').css('color', 'green')
    }
}


TestApp.prototype.showPlayerOverview = function showPlayerOverview(players) {
    function cell(content) {
        return '<td>' + content + '</td>'
    }

    function parse_styles(styles) {
        var result = ''
        for (const key in styles) {
            result += key + ': ' + styles[key] + '; '
        }
        return result
    }

    function row(previous_rows, player) {
        return previous_rows +
            '<tr>' +
            cell(player.id) +
            cell(player.name) +
            cell(player.tagger ? 'Ja' : 'Nee') +
            cell(player.position.x) +
            cell(player.position.y) +
            cell(player.position.width) +
            cell(player.position.height) +
            cell(parse_styles(player.styles)) +
            '</tr>'
    }

    var rows = players.reduce(row, '')
    $('#playerOverview').html(rows)
}


TestApp.prototype.sendName = function sendName() {
    var input = $('#newName')
    var name = input.val()
    this.socket.emit('set_name', name)
    input.val('')
}


TestApp.prototype.start = function start() {
    var _this = this
    this.socket.on('get_name', function(data) { _this.setName(data) })
    this.socket.on('tag', function(data) { _this.showTaggerText(data) })
    this.socket.on('get_players', function(data) { _this.showPlayerOverview(data) })
    $('#sendNewName').click(function(input) { _this.sendName() })
}


var app = new TestApp()
$(function() { app.start() })
