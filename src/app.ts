import { Field } from './field';
import { PlayerList, Direction } from './player';
import { Avatar } from './avatar';
import { WebServer } from './web-server';
import { ConnectionList } from './connection';
import { Styles } from './styles';


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
   * Emit new tagger info and update players.
   */
  change_tagger() {
    // Tell the player that he's the tagger and tell the previous tagger he isn't anymore.
    this.web_server.emit_tagger(
      this.connections.get_connection_by_player_id(this.players.tagger),
      this.connections.get_connection_by_player_id(this.players.previous_tagger)
    )
    // Broadcast a player overview to all.
    this.web_server.emit_players(this.players.normalize())
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
    // Change the tagger and update player info.
    this.change_tagger()
  }


  /**
   * Move the player.
   * @param {number} connection_id 
   * @param {number} direction 
   */
  move_player(connection_id: number, direction: Direction) {
    const player_id = this.connections.get_player_id(connection_id)
    if (player_id) {
      const tagger_changed = this.players.move(player_id, direction, this.field.bounds())
      if (tagger_changed) {
        this.change_tagger()
      }
      else {
        this.web_server.emit_players(this.players.normalize())
      }
    }
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
        const tagger_changed = this.players.remove_player(player_id)
        if (tagger_changed) {
          const tagger_connection_id = this.connections.get_connection_by_player_id(this.players.tagger)
          this.web_server.emit_tagger(tagger_connection_id, null)
        }
        this.web_server.emit_players(this.players.normalize())
      }
    }
    // Set a player name.
    this.web_server.callbacks.set_name = (connection_id: number, name: string) => {
      const player_id = this.connections.get_player_id(connection_id)
      if (player_id) {
        this.players.set_player_name(player_id, name)
        this.web_server.emit_name(connection_id, this.players.get_player_name(player_id))
        this.web_server.emit_players(this.players.normalize())
      }
    }
    // Move the player
    this.web_server.callbacks.move_left = (id: number) => this.move_player(id, Direction.Left)
    this.web_server.callbacks.move_right = (id: number) => this.move_player(id, Direction.Right)
    this.web_server.callbacks.move_up = (id: number) => this.move_player(id, Direction.Up)
    this.web_server.callbacks.move_down = (id: number) => this.move_player(id, Direction.Down)
    // Set styles
    this.web_server.callbacks.set_styles = (id: number, styles: Styles) => {
      const player_id = this.connections.get_player_id(id)
      if (player_id && this.players.set_styles(player_id, styles)) {
        this.web_server.emit_players(this.players.normalize())
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
