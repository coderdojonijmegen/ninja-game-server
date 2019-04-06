export interface NormalizedPos {
  x: number,
  y: number,
  width: number,
  height: number
}


export class Pos {
  constructor(
    public lx: number,
    public rx: number,
    public ty: number,
    public by: number
  ) {}

  static defaultMonitor(bounds: Pos): Pos {
    return new Pos(
      Math.max(0, bounds.lx),
      Math.min(800, bounds.rx),
      Math.max(0, bounds.ty),
      Math.min(600, bounds.by)
    )
  }

  /**
   * Check if a Pos collides with another Pos
   * @param {Pos} other
   * @returns {boolean} true if a collision happens.
   */
  has_collision(other: Pos): boolean {
    return (
      this.lx < other.rx &&
      this.rx > other.lx &&
      this.ty < other.by &&
      this.by > other.ty
    )
  }

  /**
   * Check if a Pos is within the boundaries of another Pos.
   * @param {Pos} bounds 
   * @returns {boolean} true if the Pos is within bounds.
   */
  is_within_bounds(bounds: Pos): boolean {
    return (
      this.lx >= bounds.lx &&
      this.rx <= bounds.rx &&
      this.ty >= bounds.ty &&
      this.by <= bounds.by
    )
  }

  /**
   * Calculate the object width
   * @returns {number}
   */
  get_width(): number {
    return this.rx - this.lx
  }

  set_width(width: number, max: number|null = null) {
    const new_width = (typeof max === 'number') ? Math.min(width, max) : width
    this.rx = this.lx + new_width
  }

  /**
   * Calculate the object height.
   * @returns {number}
   */
  get_height(): number {
    return this.by - this.ty
  }

  set_height(height: number, max: number|null = null) {
    const new_height = (typeof max === 'number') ? Math.min(height, max) : height
    this.by = this.ty + new_height
  }

  normalize(): NormalizedPos {
    return {
      x: this.lx,
      y: this.ty,
      width: this.get_width(),
      height: this.get_height()
    }
  }
}
