import { Field } from './field';
import { PlayerList } from './player';
import { Avatar } from './avatar';
import { WebServer } from './web-server';
import { ConnectionList } from './connection';


class App {
  field: Field
  players: PlayerList
  connections: ConnectionList
  avatars: Avatar[]
  web_server: WebServer


  constructor() {
    this.players = new PlayerList()
    this.connections = new ConnectionList()
    this.field = new Field(5000, 5000)
    this.web_server = new WebServer()
    this.avatars = Avatar.get_defaults()
  }

  /**
   * Creates a player for a new connection and sends player updates to the clients.
   * 
   * @param {number} id - The connection id.
   */
  initialize_connection(id: number) {
    const player_id = this.players.add_player()
    const name = this.players.get_player_name(player_id)

    this.connections.set_player_id(id, player_id)
    // Tell the player his new name.
    this.web_server.emit_name(id, name)
    // Tell the player that he's the tagger and tell the previous tagger he isn't anymore.
    this.web_server.emit_tagger(
      this.connections.get_connection_by_player_id(this.players.tagger),
      this.connections.get_connection_by_player_id(this.players.previous_tagger)
    )
    // Broadcast a player overview to all.
    this.web_server.emit_players(this.players.normalize())
  }


  /**
   * Set all the server callbacks and run the web server.
   */
  run() {
    // Returns a list of avatars.
    this.web_server.callbacks.avatar_list = () => this.avatars
    // Returns a new connection id.
    this.web_server.callbacks.new_connection = () => this.connections.new_connection()
    // Creates a new player for the connection and makes it the tagger.
    this.web_server.callbacks.initialize_connection = (id: number) => this.initialize_connection(id)
    // Closes the connection and removes the player, if the connection is attached to a player.
    this.web_server.callbacks.close_connection = (id: number) => {
      const player_id = this.connections.close_connection(id)
      if (player_id !== null) {
        this.players.remove_player(player_id)
      }
    }
    // Start the web server.
    this.web_server.start()
  }
}


try {
  const app = new App()
  app.run()
}
catch (error) {
  console.error("Encountered a crucial error")
  console.log(error)
}
