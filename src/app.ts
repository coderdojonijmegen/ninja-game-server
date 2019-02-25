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
   * Set all the server callbacks and run the web server.
   */
  run() {
    // Returns a list of avatars.
    this.web_server.callbacks.avatar_list = () => this.avatars
    // Returns a new connection id.
    this.web_server.callbacks.new_connection = () => this.connections.new_connection()
    // Creates a new player for the connection and makes it the tagger.
    this.web_server.callbacks.initialize_connection = (id: number) => {
      this.connections.set_player_id(id, this.players.add_player())
      this.web_server.emit_tagger(
        this.connections.get_connection_by_player_id(this.players.tagger),
        this.connections.get_connection_by_player_id(this.players.previous_tagger)
      )
    }
    // Closes the connection and removes the player, if the connection is attached to a player.
    this.web_server.callbacks.close_connection = (id: number) => {
      const player_id = this.connections.close_connection(id)
      if (player_id !== null) {
        this.players.remove_player(player_id)
      }
    }
    // Returns the player/monitor name attached to the connection.
    this.web_server.callbacks.get_name = (id: number) => {
      const player_id = this.connections.get_player_id(id)
      return (player_id === null) ? 'monitor' : this.players.get_player_name(player_id)
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
