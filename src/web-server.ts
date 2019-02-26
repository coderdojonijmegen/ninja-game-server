import Http = require('http')
import Koa = require('koa')
import KoaStatic = require('koa-static')
import KoaRouter = require('koa-router')
import SocketIO = require('socket.io')
import { Avatar } from './avatar';
import { NormalizedPlayer } from './player';

/**
 * The various callbacks for the app to use.
 */
export class ServerCallbacks {
  avatar_list: null | (() => Avatar[]) = null
  new_connection: null | (() => number) = null
  initialize_connection: null | ((id: number) => void) = null
  close_connection: null | ((id: number) => void) = null
  set_name: null | ((id: number, name: string) => void) = null
  move_left: null | ((id: number) => void) = null
  move_right: null | ((id: number) => void) = null
  move_up: null | ((id: number) => void) = null
  move_down: null | ((id: number) => void) = null
}

/**
 * A Koa web server, the main input and output of the application.
 */
export class WebServer {
  port: number = 3000
  koa: Koa
  socket_io: SocketIO.Server | null = null
  server: Http.Server | null = null
  callbacks: ServerCallbacks
  sockets: Map<number, SocketIO.Socket>

  constructor() {
    this.koa = new Koa()
    this.callbacks = new ServerCallbacks()
    this.sockets = new Map()
  }

  /**
   * A Koa object which serves the public folder.
   */
  public_folder() {
    return KoaStatic(`${__dirname}/../public`)
  }

  /**
   * The Koa API routes.
   */
  api_routes() {
    const router = new KoaRouter()
    router.get('/avatars', async (ctx) => {
      ctx.type = 'application/json'
      ctx.body = (this.callbacks.avatar_list !== null)
        ? JSON.stringify(this.callbacks.avatar_list())
        : []
    })

    return router.routes()
  }

  /**
   * The socket.io API routes.
   * @param {Http.Server} server 
   */
  socket_api(server: Http.Server) {
    this.socket_io = SocketIO(this.server)
    this.socket_io.on('connection', (socket) => {
      if (this.callbacks.new_connection) {
        const connection_id = this.callbacks.new_connection()
        this.sockets.set(connection_id, socket)
        if (this.callbacks.initialize_connection) {
          this.callbacks.initialize_connection(connection_id)
        }
        socket.on('set_name', (name: string) => {
          if (this.callbacks.set_name) {
            this.callbacks.set_name(connection_id, name)
          }
        })
        socket.on('move_left', () => {
          if (this.callbacks.move_left) {
            this.callbacks.move_left(connection_id)
          }
        })
        socket.on('move_right', () => {
          if (this.callbacks.move_right) {
            this.callbacks.move_right(connection_id)
          }
        })
        socket.on('move_up', () => {
          if (this.callbacks.move_up) {
            this.callbacks.move_up(connection_id)
          }
        })
        socket.on('move_down', () => {
          if (this.callbacks.move_down) {
            this.callbacks.move_down(connection_id)
          }
        })
        socket.on('disconnect', () => {
          if (this.callbacks.close_connection)
            this.callbacks.close_connection(connection_id)
          this.sockets.delete(connection_id)
        })
      }
    })
  }

  /**
   * Tell the tagger that he's the tagger, tell the previous tagger that he isn't anymore.
   * 
   * @param {number} connection_id_tagger 
   * @param {number} connection_id_previous_tagger 
   */
  emit_tagger(connection_id_tagger: number | null, connection_id_previous_tagger: number | null): boolean[] {
    const send_message = (is_tagger: boolean, socket: SocketIO.Socket | undefined) =>
      socket ? socket.emit('tag', is_tagger) : false

    const find_and_send = (is_tagger: boolean, id: number | null) =>
      (id) ? send_message(is_tagger, this.sockets.get(id)) : false

    return [
      find_and_send(true, connection_id_tagger),
      find_and_send(false, connection_id_previous_tagger)
    ]
  }

  /**
   * Send player info to all sockets.
   * @param {array} players 
   */
  emit_players(players: NormalizedPlayer[]) {
    if (this.socket_io) {
      this.socket_io.emit('get_players', players)
    }
  }

  /**
   * Emit the name of a connection to its socket.
   * 
   * @param {number} connection_id 
   * @param {string} name 
   */
  emit_name(connection_id: number, name: string) {
    const socket = this.sockets.get(connection_id)
    if (socket) {
      socket.emit('get_name', name)
    }
  }

  /**
   * Initializes and starts the web server.
   */
  start() {
    this.koa.use(this.api_routes())
    this.koa.use(this.public_folder())
    this.server = Http.createServer(this.koa.callback())
    this.socket_api(this.server)
    this.server.listen(this.port)

    console.log(`Listening on http://localhost:${this.port}`)
  }
}
