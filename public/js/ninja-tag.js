var socket = io()

var avatar = {
    naam: "",
    tikker: false,
    styles: {
        "background-img": "img/ninja.png",
        "width": "64px",
        "height": "64px",
    },
    // Stuur je naam naar de server.
    zet_naam: function zet_naam(naam) {
        socket.emit("set_name", naam)
    },
    // Ga een stapje naar links.
    ga_links: function ga_links() {
        socket.emit("move_left")
    },
    // Ga een stapje naar boven.
    ga_boven: function ga_boven() {
        socket.emit("move_up")
    },
    // Ga een stapje naar rechts.
    ga_rechts: function ga_rechts() {
        socket.emit("move_right")
    },
    // Ga een stapje naar onder.
    ga_onder: function ga_onder() {
        socket.emit("move_down")
    },
    // Stuur je styles naar de server.
    stuur_styles: function stuur_styles() {
        socket.emit("send_styles", this.styles)
    }
}


// Socket berichten.
socket.on("connect", function connect() {
    console.info("Je bent verbonden.")
    avatar.stuur_styles()
})
socket.on("get_name", function get_name(name) {
    avatar.naam = name
})

socket.on("tag", function tag(is_tikker) {
    if (is_tikker) {
        console.log("Je bent de tikker.")
    }
    else {
        console.log("Je bent geen tikker meer.")
    }
    avatar.tikker = true
})

socket.on("input_error", function(err) {
    console.error(err)
})
