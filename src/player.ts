import { Pos } from "./pos";
import { Avatar } from "./avatar";
import { Styles } from "./styles";
import { clearScreenDown } from "readline";



/**
 * A function used when moving a player avatar.
 * @param {number} length 
 * @param {boolean} positive
 */
function calculateMoveDelta(length: number, positive: boolean): number {
  const delta = Math.ceil(length / 10)
  const absolute = (delta > 1) ? delta : 1
  return positive ? absolute : -absolute
}


export enum Direction {
  Left,
  Right,
  Up,
  Down
}


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
   * Checks if this player collides with another.
   * @param {Player} other 
   * @returns {boolean} true if a collision takes place.
   */
  hasCollision(other: Player): boolean {
    return this.pos.hasCollision(other.pos)
  }

  /**
   * Move left.
   * @param {number} bounds 
   * @returns true if moved succesfully
   */
  move(direction: Direction, bounds: Pos): boolean {
    const d = { x: 0, y: 0 }
    switch (direction) {
      case Direction.Left:
        d.x = calculateMoveDelta(this.pos.getWidth(), false)
        break;
      case Direction.Right:
        d.x = calculateMoveDelta(this.pos.getWidth(), true)
        break;
      case Direction.Up:
        d.y = calculateMoveDelta(this.pos.getHeight(), false)
        break;
      case Direction.Down:
        d.y = calculateMoveDelta(this.pos.getHeight(), true)
    }

    const newPos = new Pos(
      this.pos.lx + d.x,
      this.pos.rx + d.x,
      this.pos.ty + d.y,
      this.pos.by + d.y
    )

    if (newPos.isWithinBounds(bounds)) {
      this.pos = newPos
      return true
    }
    else {
      return false
    }
  }

  set_styles(newStyles: Styles) {
    this.styles = {}
    for (const key in newStyles) {
      switch (key) {
        case 'width':
          this.pos.setWidth(Number.parseInt(newStyles.width))
          break;
        case 'height':
          this.pos.setHeight(Number.parseInt(newStyles.height))
          break;
        default:
          this.styles[key] = newStyles[key]
      }
    }
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
        width: this.pos.getWidth(),
        height: this.pos.getHeight()
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
   * 
   * @param {Player} player 
   * @param {boolean} perform_tagger_change 
   */
  check_tag(player: Player, perform_tagger_change: boolean): boolean {
    if (player.id === this.tagger) {
      // Player is the tagger, check collisions with other players.
      for (const other_player of this.index.values()) {
        if (other_player.id !== player.id && player.hasCollision(other_player)) {
          if (perform_tagger_change) {
            this.previous_tagger = player.id
            this.tagger = other_player.id
          }
          return true
        }
      }
    }
    else {
      // Player is not the tagger, check if he collides with the tagger.
      const tagger = this.index.get(this.tagger)
      if (tagger && player.hasCollision(tagger)) {
        if (perform_tagger_change) {
          this.previous_tagger = tagger.id
          this.tagger = player.id
        }
        return true
      }
    }
    return false
  }


  /**
   * Move a player.
   * @param {number} player_id
   * @param {number} direction 
   * @param {Pos} bounds 
   * @returns {boolean} true if the tagger has changed.
   */
  move(player_id: number, direction: Direction, bounds: Pos): boolean {
    const player = this.index.get(player_id)
    if (player) {
      const already_collided = this.check_tag(player, false)
      if (player.move(direction, bounds)) {
        return already_collided
          ? false
          : this.check_tag(player, true)
      }
    }
    return false
  }

  /**
   * Set the styles for a player.
   * @param {number} player_id 
   * @param {object} styles 
   * @returns {boolean} true if player data has changed.
   */
  set_styles(player_id: number, styles: Styles): boolean {
    const player = this.index.get(player_id)
    if (player) {
      player.set_styles(styles)
      return true
    }
    else {
      return false
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
