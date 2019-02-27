import { Avatar } from "./avatar";


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
  hasCollision(other: Pos): boolean {
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
  isWithinBounds(bounds: Pos): boolean {
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
  getWidth(): number {
    return this.rx - this.lx
  }

  setWidth(width: number) {
    this.rx = this.lx + Math.min(width, Avatar.default_width)
  }

  /**
   * Calculate the object height.
   * @returns {number}
   */
  getHeight(): number {
    return this.by - this.ty
  }

  setHeight(height: number) {
    this.by = this.ty + Math.min(height, Avatar.default_height)
  }

  normalize(): NormalizedPos {
    return {
      x: this.rx,
      y: this.ty,
      width: this.getWidth(),
      height: this.getHeight()
    }
  }
}
