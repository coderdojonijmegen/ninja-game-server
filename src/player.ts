import { Pos } from "./pos";
import { Avatar } from "./avatar";
import { Styles } from "./styles";


export interface NormalizedPlayer {
  id: number
  name: string
  tagger: boolean
  styles: {
    [key:string]: string
  }
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}


export class Player {
  pos: Pos
  styles: Styles = {}

  constructor(
    public id: number,
    public name: string,
    x: number,
    y: number
  ) {
    this.pos = new Pos(
      x, x + Avatar.default_width,
      y, y + Avatar.default_height
    )
  }

  /**
   * Create a normalized player object, to send to the clients.
   * @param {number} tagger_id 
   * @returns {object}
   */
  normalize(tagger_id: number): NormalizedPlayer {
    return {
      id: this.id,
      name: this.name,
      tagger: tagger_id === this.id,
      styles: this.styles,
      position: {
        x: this.pos.lx,
        y: this.pos.ty,
        width: this.pos.rx - this.pos.lx,
        height: this.pos.by - this.pos.ty
      }
    }
  }
}

export class PlayerList {
  index: Map<number, Player>
  tagger: number = 0
  previous_tagger: number = 0

  constructor() {
    this.index = new Map()
  }

  /**
   * Retrieve the largest player id.
   */
  max_player_id(): number {
    return Array.from(this.index.keys()).reduce((a,b) => Math.max(a, b), 0)
  }

  /**
   * Add a new player
   */
  add_player(): number {
    // TODO: check that each player has a unique name.
    const new_id = this.max_player_id() + 1
    this.index.set(new_id, new Player(new_id, "anon" + new_id, 2500, 2500))
    this.previous_tagger = this.tagger
    this.tagger = new_id
    return new_id
  }

  /**
   * Removes a certain player from the game.
   * 
   * If this player is the tagger, tagger is redirected to the player with the largest id.
   * 
   * @returns {boolean} - Returns true if the tagger has changed.
   */
  remove_player(id: number): boolean {
    this.index.delete(id)
    if (this.tagger === id) {
      this.previous_tagger = 0
      this.tagger = this.max_player_id()
      return true
    }
    return false
  }

  /**
   * Get a player name.
   * @param id - The player id
   */
  get_player_name(id: number): string {
    const player = this.index.get(id)
    return (player) ? player.name : 'unknown player'
  }

  /**
   * Set a player name.
   * @param {number }id 
   * @param {string} name 
   */
  set_player_name(id: number, name: string): void {
    const player = this.index.get(id)
    if (player) {
      player.name = name
    }
  }

  /**
   * Create an array of normalized player objects, to send to the clients.
   * @returns {array}
   */
  normalize(): NormalizedPlayer[] {
    return Array.from(this.index.values()).map(player => player.normalize(this.tagger))
  }
}
