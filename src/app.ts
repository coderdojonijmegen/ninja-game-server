import { Field } from './field';
import { Player } from './player';
import { Avatar } from './avatar';
import { Tagger } from './tagger';
import { WebServer } from './web-server';


class App {
  field: Field
  tagger: Tagger|null = null
  players: Player[] = []
  avatars: Avatar[]
  web_server: WebServer


  constructor() {
    this.field = new Field(5000, 5000)
    this.web_server = new WebServer()
    this.avatars = Avatar.get_defaults()
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
