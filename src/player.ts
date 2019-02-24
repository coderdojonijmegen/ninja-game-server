import { Pos } from "./pos";
import { Avatar } from "./avatar";
import { Styles } from "./styles";

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
}
