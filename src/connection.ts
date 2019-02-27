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
  new_connection(): number {
    const max_connection_id =
      Array.from(this.index.keys()).reduce((a,b) => Math.max(a, b), 0)

    const new_id = max_connection_id + 1
    this.index.set(new_id, new Connection(new_id, null))
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

  /**
   * Sets a player id for the connection.
   * @param {number} connection_id 
   * @param {number} player_id 
   */
  set_player_id(connection_id: number, player_id: number) {
    const connection = this.index.get(connection_id)
    if (connection) {
      connection.player_id = player_id
    }
  }

  /**
   * Remove and return the player id from the connection.
   * @param {number} connection_id 
   * @returns {number|null} the former player id.
   */
  spectate(connection_id: number): number|null {
    const connection = this.index.get(connection_id)
    if (connection) {
      const player_id = connection.player_id
      connection.player_id = null
      return player_id
    }
    else {
      return null
    }
  }

  /**
   * Find a connection, by looking up the player ids.
   * @param {number} player_id 
   */
  get_connection_by_player_id(player_id: number): number|null {
    for (const connection of this.index.values()) {
      if (connection.player_id === player_id) {
        return connection.id
      }
    }
    return null
  }
}
