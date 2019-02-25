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
    this.web_server.callbacks.avatar_list = () => this.avatars
    this.web_server.callbacks.new_connection = () => this.connections.new_connection(this.players.add_player())
    this.web_server.callbacks.close_connection = (id: number) => {
      const player_id = this.connections.close_connection(id)
      if (player_id !== null) {
        this.players.remove_player(player_id)
      }
    }
    this.web_server.callbacks.get_name = (id: number) => {
      const player_id = this.connections.get_player_id(id)
      return (player_id === null) ? 'monitor' : this.players.get_player_name(player_id)
    }
    
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
