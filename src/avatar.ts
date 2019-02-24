export class Avatar {
  static default_width = 64
  static default_height = 64

  constructor(
    public name: string,
    public path: string
  ) {}

  /**
   * Lists the default avatars.
   */
  static get_defaults(): Avatar[] {
    return [
      new Avatar('Ninja', '/img/ninja.png'),
      new Avatar('CoderDojo logo', '/img/coderdojo.png'),
    ]
  }
}
