import { Field } from './field';
import { Player } from './player';
import { Avatar } from './avatar';
import { Tagger } from './tagger';
import { WebServer } from './web-server';
import { Connection } from './connection';


class App {
  field: Field
  tagger: Tagger|null = null
  players: Player[] = []
  connections: Connection[] = []
  avatars: Avatar[]
  web_server: WebServer


  constructor() {
    this.field = new Field(5000, 5000)
    this.web_server = new WebServer()
    this.avatars = Avatar.get_defaults()
  }

  /**
   * Set up a new connection. A connected client is automatically a player.
   */
  new_connection(): number {
    const max_connection_id =
      this.connections.reduce((a,c) => Math.max(a, c.id), 0)
    const new_id = max_connection_id + 1
    const connection = new Connection(new_id, this.add_player())
    
    this.connections.push(connection)
    return new_id
  }

  /**
   * Get the player id for current connection.
   * @param {number} connection_id
   */
  get_player_id(connection_id: number): number|null {
    const connection = this.connections.find(
      conn => (conn.id === connection_id)
    )
    return (connection) ? connection.player_id : null
  }

  /**
   * Close the connection.
   * @param {number} id - The connection id.
   */
  close_connection(id: number) {
    const player_id = this.get_player_id(id)
    if (player_id) {
      this.remove_player(player_id)
    }
    this.connections = this.connections.filter(conn => (conn.id !== id))
  }

  /**
   * Retrieve the largest player id.
   */
  max_player_id(): number {
    return this.players.reduce((a,c) => Math.max(a, c.id), 0)
  }

  /**
   * Add a new player
   */
  add_player(): number {
    const max_id = this.players.reduce(
      (acc, cur) => (cur.id > acc) ? cur.id : acc,
      0
    )
    const new_id = max_id + 1
    this.players.push(new Player(new_id, "anon" + max_id, 2500, 2500))
    return new_id
  }

  /**
   * Removes a certain player from the game.
   * 
   * If this player is the tagger, tagger is redirected to the player with
   * the largest id.
   */
  remove_player(id: number) {
    this.players = this.players.filter(player => player.id !== id)
    if (this.tagger && this.tagger.player_id === id) {
      this.tagger.player_id = this.max_player_id()
    }
  }

  /**
   * Run the application.
   */
  run() {
    this.web_server.callbacks.avatar_list = () => this.avatars
    this.web_server.callbacks.new_connection = () => this.new_connection()
    this.web_server.callbacks.close_connection = (id: number) => this.close_connection(id)
    this.web_server.callbacks.get_name = (id: number) => {
      const player_id = this.get_player_id(id)
      const player = this.players.find(player => player.id === player_id)

      return (player) ? player.name : 'monitor'
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
