export class Pos {
  constructor(
    public lx: number,
    public rx: number,
    public ty: number,
    public by: number
  ) {}

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

  /**
   * Calculate the object height.
   * @returns {number}
   */
  getHeight(): number {
    return this.by - this.ty
  }
}
