import { AppFastifyInstance } from '../types/fastify';
import { createWorker } from 'mediasoup'
import Room from '../room';
import sdpTransform from 'sdp-transform'

import { generateOffer, generateAnswer } from '../libs/sdp'
import { getDtlsParameters, getProduceOptions } from '../libs/parse-sdp'

export default async function app (fastify: AppFastifyInstance){

	const worker = await createWorker({ logLevel: "debug"	})

	fastify.decorate("worker", worker)
	fastify.decorate("rooms", new Map())

	fastify.post("/rooms", async () => {
		const room = new Room()
		await room.init(fastify.worker)
		fastify.rooms.set(room.id, room)

		return { room_id: room.id }
	})

	fastify.post("/rooms/:room_id/users/:user_id", async (request) => {
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

		const offer = { sdp: generateOffer(user.consumeTransport, []), type: 'offer' }

		return { offer: null, transport, routerRtpCapabilities: room.router.rtpCapabilities }
	})


	fastify.post("/rooms/:room_id/users/:user_id/produce", async (request) => {
		const { room_id, user_id } = request.params as any
		const { offer } = request.body as any

		const room = fastify.rooms.get(room_id)
		const user = room.users.get(user_id)
		const sdp = sdpTransform.parse(offer.sdp)

		const dtlsParameters = getDtlsParameters(sdp)
		await user.createProduceTransport(room.router)
		await user.confirmProduceTransport({ dtlsParameters })

		const produceOptions = getProduceOptions (sdp)

		await user.produce(produceOptions)
		
		const answer = { sdp: generateAnswer(user.produceTransport, user.producers ), type: 'answer' }

		const outbound = []
		for(let [ key, _user ] of room.users){
			if(key === user_id) continue
			
			await _user.addConsumers(user, room.router)
			
			const offer = { sdp: generateOffer(_user.consumeTransport, _user.consumers), type: 'offer' }

			const consumers = _user.consumers.map(consumer => ({
				id: consumer.id,
				producerId: consumer.producerId,
				kind: consumer.kind,
				rtpParameters: consumer.rtpParameters
			}))
			
			outbound.push({ id: key, offer, consumers })
		}

		return { answer, outbound }
	})

	fastify.post("/rooms/:room_id/users/:user_id/consume", async (request) => {
		const { room_id, user_id } = request.params as any
		const { answer } = request.body as any

		const room = fastify.rooms.get(room_id)
		const user = room.users.get(user_id)
		const sdp = sdpTransform.parse(answer.sdp)

		const dtlsParameters = getDtlsParameters(sdp)

		await user.confirmConsumeTransport({ dtlsParameters })
		await user.resumeConsumers()

		return { success: "success" }
	});


	fastify.post("/rooms/:room_id/users/:user_id/_consume", async (request) => {
		const { room_id, user_id } = request.params as any
		const { dtlsParameters } = request.body as any

		const room = fastify.rooms.get(room_id)
		const user = room.users.get(user_id)

		await user.confirmConsumeTransport({ dtlsParameters })

		return { success: "success" }
	})

	fastify.put("/rooms/:room_id/users/:user_id/_consume", async(request) => {
		const { room_id, user_id } = request.params as any

		const room = fastify.rooms.get(room_id)
		const user = room.users.get(user_id)

		await user.resumeConsumers()
		return { success: "success" }
	})

	// fastify.post("/rooms/:room_id/ts", async (request) => {
	// 	const { room_id } = request.params as any
	// 	const { incoming } = request.body as any
	// 	const room = fastify.rooms.get(room_id)

	// 	return await room.createTransport(incoming)
	// })

	// fastify.post("/rooms/:room_id/ts/:transport_id", async (request) => {
	// 	const { room_id, transport_id } = request.params as any
	// 	const { dtlsParameters } = request.body as any 
	// 	const room = fastify.rooms.get(room_id)

	// 	await room.confirmTransport(transport_id, dtlsParameters)
	// 	return { success: "success" }
	// })

	// fastify.post("/rooms/:room_id/ts/:transport_id/produce", async (request) => {
	// 	const { room_id, transport_id } = request.params as any
	// 	const { kind, rtpParameters } = request.body as any
	// 	const room = fastify.rooms.get(room_id)

	// 	return await room.createProducer(transport_id, { kind, rtpParameters })
	// })

	// fastify.post("/rooms/:room_id/ts/:transport_id/consume", async (request) => {
	// 	const { room_id, transport_id } = request.params as any
	// 	const room = fastify.rooms.get(room_id)

	// 	return await room.createConsumers(transport_id)
	// })

	// fastify.post("/rooms/:room_id/ts/:transport_id/resume", async (request) => {
	// 	const { room_id, transport_id } = request.params as any
	// 	const room = fastify.rooms.get(room_id)

	// 	await room.resumeConsume(transport_id)

	// 	return { success: "success"}
	// })
}