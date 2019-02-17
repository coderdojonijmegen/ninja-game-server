import Koa = require('koa')
import KoaStatic = require('koa-static')


const server = new Koa()
server.use(KoaStatic(`${__dirname}/../public`))

server.listen(3000)
console.log('Listening on http://localhost:3000')
