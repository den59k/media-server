import { AppFastifyInstance } from '../types/fastify';
import { createWorker } from 'mediasoup'
import Room from '../room';
import sdpTransform from 'sdp-transform'

import { generateOffer, generateAnswer } from '../libs/sdp'
import { getDtlsParameters, getProduceOptions } from '../libs/parse-sdp'
import { FastifyReply, FastifyRequest } from 'fastify';
import { createRoomSchema, paramsRoomSchema, paramsSchema } from './schema';

export default async function app (fastify: AppFastifyInstance){

	const worker = await createWorker({ 
		logLevel: "debug",
		rtcMinPort: parseInt(process.env.RTC_MIN_PORT) || 10000,
		rtcMaxPort: parseInt(process.env.RTC_MAX_PORT) || 59999	
	})

	fastify.decorate("worker", worker)
	fastify.decorate("rooms", new Map())

	//Простой тестовый роут
	fastify.get("/", async () => { 
		return { word: "hello world" }
	})

	//Создание комнаты
	const createRoomHandler = async (request: FastifyRequest, reply: FastifyReply) => {
		const { room_id } = request.params as any
		const { userId } = request.body as any

		if(fastify.rooms.has(room_id)) return reply.code(409).send({ error: { room_id: `Room ${room_id} already exists`} })

		const room = new Room(room_id)
		await room.init(fastify.worker)
		fastify.rooms.set(room.id, room)

		if(userId)
			await room.addUser(userId)

		return { room_id: room.id, user_id: userId }
	}
	fastify.post("/rooms",  { schema: createRoomSchema }, createRoomHandler)
	fastify.post("/rooms/:room_id",  { schema: { ...createRoomSchema, ...paramsRoomSchema } }, createRoomHandler)

	//Получение списка всех комнат
	fastify.get("/rooms", async () => {
		const rooms = []
		for(let room of fastify.rooms.values())
			rooms.push({ id: room.id, usersCount: room.users.size })
		
		return rooms
	})

	//Получение информации о комнате
	fastify.get("/rooms/:room_id", { schema: paramsRoomSchema }, async (request, reply) => {
		const { room_id } = request.params as any
		const room = fastify.rooms.get(room_id)
		if(!room) return reply.code(404).send({ error: { room_id: "Room is not exists" }})

		const users = []
		for(let user of room.users.values()){
			users.push({ 
				id: user.id, 
				consume: {
					transportId: user.consumeTransport.id,
					bytesSent: (await user.consumeTransport.getStats())[0].bytesSent
				},
				produce: user.produceTransport && user.producers.length > 0 && {
					transportId: user.produceTransport.id,
					cname: user.producers[0].rtpParameters.rtcp.cname,
					bytesReceived: (await user.produceTransport.getStats())[0].bytesReceived
				}
			})
		}

		return { router: { id: room.router.id }, users }
	})

	//Добавление пользователя в комнату
	fastify.post("/rooms/:room_id/users/:user_id", { schema: paramsSchema }, async (request) => {
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

	//Начало вещания пользователем
	fastify.post("/rooms/:room_id/users/:user_id/produce", { schema: paramsSchema }, async (request) => {
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
			
			outbound.push({ id: key, offer })
		}

		return { answer, outbound }
	})

	fastify.post("/rooms/:room_id/users/:user_id/consume", { schema: paramsSchema }, async (request) => {
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

	fastify.delete("/rooms/:room_id", { schema: paramsRoomSchema }, async (request, reply) => {
		const { room_id } = request.params as any
		const room = fastify.rooms.get(room_id)
		if(!room) return reply.code(404).send({ error: { room_id: "room not found" } })

		room.dispose()
		fastify.rooms.delete(room_id)
		return { count: 1 }
	})


	// fastify.post("/rooms/:room_id/users/:user_id/_consume", async (request) => {
	// 	const { room_id, user_id } = request.params as any
	// 	const { dtlsParameters } = request.body as any

	// 	const room = fastify.rooms.get(room_id)
	// 	const user = room.users.get(user_id)

	// 	await user.confirmConsumeTransport({ dtlsParameters })

	// 	return { success: "success" }
	// })

	// fastify.put("/rooms/:room_id/users/:user_id/_consume", async(request) => {
	// 	const { room_id, user_id } = request.params as any

	// 	const room = fastify.rooms.get(room_id)
	// 	const user = room.users.get(user_id)

	// 	await user.resumeConsumers()
	// 	return { success: "success" }
	// })

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