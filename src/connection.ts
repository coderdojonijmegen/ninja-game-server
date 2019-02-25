export class Connection {
  constructor(
    public id: number,
    public player_id: number|null
  ) {}
}


export class ConnectionList {
  index: Map<number, Connection>

  constructor() {
    this.index = new Map()
  }


  /**
   * Set up a new connection. A connected client is automatically a player.
   */
  new_connection(player_id: number): number {
    const max_connection_id =
      Array.from(this.index.keys()).reduce((a,b) => Math.max(a, b), 0)

    const new_id = max_connection_id + 1
    this.index.set(new_id, new Connection(new_id, player_id))
    return new_id
  }


  /**
   * Close the connection.
   * @param {number} id - The connection id.
   * @returns {number|null} - The player id, if there is any.
   */
  close_connection(id: number): number|null {
    const player_id = this.get_player_id(id)
    this.index.delete(id)

    return player_id
  }


  /**
   * Get the player id for current connection.
   * @param {number} connection_id
   * @returns {number|null}
   */
  get_player_id(connection_id: number): number|null {
    const connection = this.index.get(connection_id)

    return (connection) ? connection.player_id : null
  }
}
