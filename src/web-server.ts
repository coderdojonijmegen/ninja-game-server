import Koa = require('koa')
import KoaStatic = require('koa-static')
import KoaRouter = require('koa-router')
import { Avatar } from './avatar';

/**
 * The various callbacks for the app to use.
 */
export class ServerCallbacks {
  avatar_list: null|(() => Avatar[]) = null
}

/**
 * A Koa web server, the main input and output of the application.
 */
export class WebServer {
  port: number = 3000
  koa: Koa
  callbacks: ServerCallbacks

  constructor() {
    this.koa = new Koa()
    this.callbacks = new ServerCallbacks()
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
   * Initializes and starts the web server.
   */
  start() {
    this.koa.use(this.api_routes())
    this.koa.use(this.public_folder())
    this.koa.listen(this.port)

    console.log(`Listening on http://localhost:${this.port}`)
  }
}
