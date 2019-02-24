import Http = require('http')
import Koa = require('koa')
import KoaStatic = require('koa-static')
import KoaRouter = require('koa-router')
import SocketIO = require('socket.io')
import { Avatar } from './avatar';

/**
 * The various callbacks for the app to use.
 */
export class ServerCallbacks {
  avatar_list: null|(() => Avatar[]) = null
  new_connection: null|(() => number) = null
  close_connection: null|((id: number) => void) = null
  get_name: null|((id: number) => string) = null
}

/**
 * A Koa web server, the main input and output of the application.
 */
export class WebServer {
  port: number = 3000
  koa: Koa
  socket_io: SocketIO.Server|null = null
  server: Http.Server|null = null
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
        if (this.callbacks.get_name) {
          socket.emit('get_name', this.callbacks.get_name(connection_id))
        }
        socket.on('disconnect', () => {
          if (this.callbacks.close_connection)
            this.callbacks.close_connection(connection_id)
            this.sockets.delete(connection_id)
        })
      }
    })
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
