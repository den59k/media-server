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
    
		const users = []
		for(let user of room.users.values()){
			users.push({ 
				id: user.id, 
				consume: {
					transportId: user.consumeTransport.id,
					consumersCount: user._consumers.size,
					bytesSent: (await user.consumeTransport.getStats())[0].bytesSent
				},
				produce: user.produceTransport && user._producers.size > 0 && {
					transportId: user.produceTransport.id,
					cname: user.producers[0].rtpParameters.rtcp.cname,
					producersCount: user._producers.size,
					bytesReceived: (await user.produceTransport.getStats())[0].bytesReceived
				}
			})
		}

		return { router: { id: room.router.id }, users }
	})

	//Добавление пользователя в комнату
	fastify.post("/users/:user_id", { schema: userParamsSchema }, async (request) => {
		const { room_id, user_id } = request.params as any
		const room = fastify.rooms.get(room_id)
		const user = await room.addUser(user_id)
		
		const transport = {
			id: user.consumeTransport.id,
			iceParameters: user.consumeTransport.iceParameters,
			iceCandidates: user.consumeTransport.iceCandidates,
			dtlsParameters: user.consumeTransport.dtlsParameters,
			sctpParameters: user.consumeTransport.sctpParameters
		}

		const consumers = await room.addConsumersToUser(user_id)
		
		const offer = consumers.length > 0? 
			({ sdp: generateOffer(user.consumeTransport, consumers), type: 'offer' }): 
			null

		return { offer, transport }
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