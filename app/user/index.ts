import { FastifyInstance } from "fastify";
import { paramsSchema } from "./schema";
import sdpTransform from 'sdp-transform'

import { generateOffer, generateAnswer } from '../../libs/sdp'
import { getDtlsParameters, getProduceOptions } from '../../libs/parse-sdp'
import delay from "../../libs/delay";

export default async function userRoutes (fastify: FastifyInstance){
  fastify.addHook("preHandler", async (request, reply) => {
		const { room_id, user_id } = request.params as any
		const room = fastify.rooms.get(room_id)

    if(!room) return reply.code(404).send({ error: { room_id: "room not found" } }) 
    if(!room.users.has(user_id)) return reply.code(404).send({ error: { room_id: "user not found" } }) 

    request.room = room
    request.user_id = user_id
	})

  //Начало вещания пользователем
	fastify.post("/produce", { schema: paramsSchema }, async (request, reply) => {
		const { room, user_id } = request
		const { offer, constraints } = request.body as any
		
		if(!offer && !room.connectors.has(user_id))
			return reply.status(404).send({ error: { user_id: "User is not produce. Offer required" } })

		//Если у нас нет offer, то мы просто обновляем constraints
		if(!offer){
			const response = await room.updateConstraints(user_id, constraints)
			return response
		}

		const response = await room.produce(user_id, offer.sdp || offer, constraints)
		return response
	})

	fastify.delete("/produce", { schema: paramsSchema }, async (request, reply) => {
		const { room, user_id } = request
		if(!room.connectors.has(user_id))
			return reply.status(404).send({ error: { user_id: "User is not produce" } })
		
		const response = room.stopProduce(user_id)
		return response
	})

  fastify.post("/consume", { schema: paramsSchema }, async (request) => {
		const { room, user_id } = request
		const { answers, id, answer } = request.body as any

		if(answers && Array.isArray(answers)){
			for(let { id, answer } of answers)
				await room.confirmConsumeTransport(user_id, id, answer.sdp || answer)
		}

		if(id && answer)
			await room.confirmConsumeTransport(user_id, id, answer.sdp || answer)
		
		return { status: "connected" }
	});

  fastify.delete("/", { schema: paramsSchema }, async (request, reply) => {
		const { room, user_id } = request

		const resp = room.deleteUser(user_id)

		if(room.users.size === 0){
			fastify.rooms.delete(room.id)
			room.dispose()
		}
		return resp
	})
}

