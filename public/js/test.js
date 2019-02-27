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
        for (var key in styles) {
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

TestApp.prototype.keydown = function keydown(key_code) {
    switch (key_code) {
        case 37:
            this.socket.emit('move_left')
            break;
        case 38:
            this.socket.emit('move_up')
            break;
        case 39:
            this.socket.emit('move_right')
            break;
        case 40:
            this.socket.emit('move_down')
            break;
    }
}

TestApp.prototype.addStylesRow = function addStylesRow() {
    var row = $('<tr><td><input type="text" class="input styleKey"></td><td><input type="text" class="input styleValue"></td><td><button class="button is-danger deleteRow"><span class="icon"><i class="fas fa-minus-circle"></i></span></button></td></tr>')
    $('#stylesTableBody').append(row)
    $('.deleteRow').click(function() { $(this).closest('tr').remove() })
}

TestApp.prototype.sendStyles = function sendStyles(form) {
    var keys = []
    $('.styleKey').each(function() {
        keys.push(this.value)
    })
    var styles = {}
    $('.styleValue').each(function(index) {
        styles[keys[index]] = this.value
    })
    this.socket.emit('set_styles', styles)
}

TestApp.prototype.showInputError = function showInputError(msg) {
    var notification = $('<div class="notification is-warning"><button class="delete"></button><span>' + msg + '</span></div>')
    $('#notifications').append(notification)
    $('.notification > .delete').click(function() { $(this).closest('.notification').remove() })
}

TestApp.prototype.showMonitor = function showMonitor(pos) {
    $('#monitorX').text(pos.x)
    $('#monitorY').text(pos.y)
    $('#monitorWidth').text(pos.width)
    $('#monitorHeight').text(pos.height)
}

TestApp.prototype.start = function start() {
    var _this = this

    // Socket input
    this.socket.on('get_name', function(data) { _this.setName(data) })
    this.socket.on('tag', function(data) { _this.showTaggerText(data) })
    this.socket.on('get_players', function(data) { _this.showPlayerOverview(data) })
    this.socket.on('input_error', function(data) { _this.showInputError(data) })
    this.socket.on('tagger_monitor', function(data) { _this.showMonitor(data) })

    // User input
    $('#sendNewName').click(function() { _this.sendName() })
    $('#moveLeft').click(function() { _this.socket.emit('move_left') })
    $('#moveRight').click(function() { _this.socket.emit('move_right') })
    $('#moveUp').click(function() { _this.socket.emit('move_up') })
    $('#moveDown').click(function() { _this.socket.emit('move_down') })
    $(document).keydown(function(e) { _this.keydown(e.which) })
    $('#addStylesRow').click(function() { _this.addStylesRow() })
    $('#sendStyles').click(function() { _this.sendStyles() })
    $('.deleteRow').click(function() { $(this).closest('tr').remove() })
    $('#spectate').click(function() { _this.socket.emit('spectate') })
}


var app = new TestApp()
$(function() { app.start() })
