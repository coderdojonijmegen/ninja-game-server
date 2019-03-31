import { Pos, NormalizedPos } from "./pos";
import { Avatar } from "./avatar";
import { Styles } from "./styles";



/**
 * A function used when moving a player avatar.
 * @param {number} length 
 * @param {boolean} positive
 */
function calculate_move_delta(length: number, positive: boolean): number {
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
  position: NormalizedPos
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
  has_collision(other: Player): boolean {
    return this.pos.has_collision(other.pos)
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
        d.x = calculate_move_delta(this.pos.get_width(), false)
        break;
      case Direction.Right:
        d.x = calculate_move_delta(this.pos.get_width(), true)
        break;
      case Direction.Up:
        d.y = calculate_move_delta(this.pos.get_height(), false)
        break;
      case Direction.Down:
        d.y = calculate_move_delta(this.pos.get_height(), true)
    }

    const newPos = new Pos(
      this.pos.lx + d.x,
      this.pos.rx + d.x,
      this.pos.ty + d.y,
      this.pos.by + d.y
    )

    if (newPos.is_within_bounds(bounds)) {
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
          this.pos.set_width(Number.parseInt(newStyles.width))
          break;
        case 'height':
          this.pos.set_height(Number.parseInt(newStyles.height))
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
      position: this.pos.normalize()
    }
  }
}

export class PlayerList {
  index: Map<number, Player>
  name_list: Set<string>
  tagger: number = 0
  previous_tagger: number = 0

  constructor() {
    this.index = new Map()
    this.name_list = new Set()
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
    this.index.set(new_id, new Player(new_id, "", 0, 0))
    this.set_player_name(new_id, "anon")
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
   * Set a unique player name.
   * @param {number} id 
   * @param {string} name 
   */
  set_player_name(id: number, name: string): void {
    const player = this.index.get(id)
    if (player) {
      this.name_list.delete(player.name)
      const trimmed_name = name.trim()
      const correct_name = (trimmed_name.length > 0) ? trimmed_name : 'anon'
      
      if (this.name_list.has(correct_name)) {
        let i = 1
        while (this.name_list.has(correct_name + i)) {
          i++
        }
        player.name = correct_name + i
      }
      else {
        player.name = correct_name
      }
      this.name_list.add(player.name)
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
        if (other_player.id !== player.id && player.has_collision(other_player)) {
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
      if (tagger && player.has_collision(tagger)) {
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
   * Get the positioning
   * @param {object} bounds 
   * @returns {object}
   */
  get_tagger_monitor(bounds: Pos): NormalizedPos {
    const tagger = this.index.get(this.tagger)
    const default_monitor = Pos.defaultMonitor(bounds)
    if (tagger) {
      const half_width = default_monitor.get_width() / 2
      const half_height = default_monitor.get_height() / 2
      const tagger_monitor = new Pos(
        tagger.pos.lx - half_width, tagger.pos.lx + half_width,
        tagger.pos.ty - half_height, tagger.pos.ty + half_height
      )
      const x = () => {
        if (tagger_monitor.lx < default_monitor.lx) {
          return default_monitor.lx
        }
        else if (tagger_monitor.rx > bounds.rx) {
          return bounds.rx - default_monitor.get_width()
        }
        else {
          return tagger_monitor.lx
        }
      }

      const y = () => {
        if (tagger_monitor.ty < default_monitor.ty) {
          return default_monitor.ty
        }
        else if (tagger_monitor.by > bounds.by) {
          return bounds.by - default_monitor.get_height()
        }
        else {
          return tagger_monitor.ty
        }
      }


      return {
        x: x(),
        y: y(),
        width: default_monitor.get_width(),
        height: default_monitor.get_height()
      }
    }
    else {
      return default_monitor.normalize()
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
