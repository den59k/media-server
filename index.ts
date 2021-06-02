import fastify from 'fastify'
import app from './app'
import cors from 'fastify-cors'

const server = fastify()
//Добавляем всё наше приложение к fastify
server.register(app)

server.register(cors, {
  origin: '*',
  methods: "*",
  allowedHeaders: "*"
})

server.setErrorHandler(function (error, _request, reply) {
  console.log(error)
  reply.status(500).send({ error: 'Ошибка сервера' })
})

const port = 5000
const address = 'localhost'
server.listen(process.env.PORT || port, process.env.ADDRESS || address, function (err, address) {
  if (err) {
    console.log(err)
		return
  }
  console.log(`server listening on ${address}`)
})
