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

    const user = room.users.get(user_id)
    if(!user) return reply.code(404).send({ error: { room_id: "user not found" } }) 

    request.room = room
    request.user = user
	})

  //Начало вещания пользователем
	fastify.post("/produce", { schema: paramsSchema }, async (request, reply) => {
		const { room, user } = request
		const { offer } = request.body as any

		const sdp = sdpTransform.parse(offer.sdp)

		const dtlsParameters = getDtlsParameters(sdp)
		await user.createProduceTransport(room.router)
		await user.confirmProduceTransport({ dtlsParameters })

		const produceOptions = getProduceOptions (sdp)

		await user.produce(produceOptions)
		
		const answer = { sdp: generateAnswer(user.produceTransport, user.producers ), type: 'answer' }

		const outbound = []
		for(let [ key, _user ] of room.users){
			if(key === user.id) continue
			
			await _user.addConsumers(user, room.router)
			
			const offer = { sdp: generateOffer(_user.consumeTransport, _user.consumers ), type: 'offer' }
			outbound.push({ id: key, offer })
		}

		return { answer, outbound }
	})

  fastify.post("/consume", { schema: paramsSchema }, async (request) => {
		const { user } = request
		const { answer } = request.body as any

		const sdp = sdpTransform.parse(answer.sdp)

		const dtlsParameters = getDtlsParameters(sdp)

		await user.confirmConsumeTransport({ dtlsParameters })
		await delay(100)
		await user.resumeConsumers()

		return { success: "success" }
	});

  fastify.delete("/", { schema: paramsSchema }, async (request, reply) => {
		const { room, user } = request

		const outbound = []
		for(let [ key, _user ] of room.users){
			if(key === user.id) continue
			const count = _user.deleteConsumers(user)
			if(count === 0) continue

			const offer = { sdp: generateOffer(_user.consumeTransport, _user.consumers ), type: 'offer' }
			outbound.push({ id: key, offer })
		}

		room.deleteUser(user.id)

		return { outbound }
	})
}

