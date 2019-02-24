import Koa = require('koa')
import KoaStatic = require('koa-static')
import { Field } from './field';
import { Player } from './player';
import { Avatar } from './avatar';
import { Tagger } from './tagger';


class App {
  field: Field
  tagger: Tagger|null = null
  players: Player[] = []
  avatars: Avatar[] = []

  constructor() {
    this.field = new Field(5000, 5000)
  }

  add_player() {
    const max_id = this.players.reduce(
      (acc, cur) => (cur.id > acc) ? cur.id : acc,
      0
    )
    this.players.push(new Player(max_id + 1, "anon" + max_id, 2500, 2500))
  }
}


const server = new Koa()
server.use(KoaStatic(`${__dirname}/../public`))

server.listen(3000)
console.log('Listening on http://localhost:3000')
