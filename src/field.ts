import { Pos } from "./pos";

export class Field {
  constructor(
    public width: number,
    public height: number
  ) {}

  /**
   * Get the boundaries for the field.
   * @returns {Pos}
   */
  bounds(): Pos {
    return new Pos(0, this.width, 0, this.height)
  }
}
