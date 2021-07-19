import { FastifyInstance } from "fastify";
import { generateOffer } from "../../libs/sdp";
import { paramsSchema, userParamsSchema } from './schema';

export default async function roomRoutes (fastify: FastifyInstance){
  fastify.addHook("preHandler", async (request, reply) => {
		const { room_id } = request.params as any
		const room = fastify.rooms.get(room_id)
    if(!room) return reply.code(404).send({ error: { room_id: "room not found" } }) 
    request.room = room
	})

  //Получение информации о комнате
	fastify.get("/", { schema: paramsSchema }, async (request, reply) => {
		const { room } = request
    const users = await room.getUsersStats()

		return { router: { id: room.router.id }, users }
	})

	//Добавление пользователя в комнату
	fastify.post("/users/:user_id", { schema: userParamsSchema }, async (request, reply) => {
		const { user_id } = request.params as any
		const { userInfo } = request.body as any
		const { room } = request
		if(room.users.has(user_id)) return reply.code(403).send({ error: { user_id: `user ${user_id} aleady exists` }})

		const users = await room.addUser(user_id, userInfo)
		return { userId: user_id, userInfo, users }
	})

	fastify.delete("/", { schema: paramsSchema }, async (request, reply) => {
		const { room_id } = request.params as any
		const room = fastify.rooms.get(room_id)
		if(!room) return reply.code(404).send({ error: { room_id: "room not found" } })

		room.dispose()
		fastify.rooms.delete(room_id)
		return { count: 1 }
	})

}