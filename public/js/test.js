function TestApp() {
    this.socket = io()
}


TestApp.prototype.setName = function setName(name) {
    $('#playerName').text(name)
}


TestApp.prototype.start = function start() {
    var _this = this
    this.socket.on('get_name', function(data) { _this.setName(data) })
}


var app = new TestApp()
$(function() { app.start() })
