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


TestApp.prototype.start = function start() {
    var _this = this
    this.socket.on('get_name', function(data) { _this.setName(data) })
    this.socket.on('tag', function(data) { _this.showTaggerText(data) })
}


var app = new TestApp()
$(function() { app.start() })
