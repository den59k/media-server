import { createWorker } from 'mediasoup'
import Room from '../room';
import sdpTransform from 'sdp-transform'

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createRoomSchema, paramsRoomSchema } from './schema';

import roomRoutes from './room';
import userRoutes from './user';

export default async function app (fastify: FastifyInstance){

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
		const { userId, userInfo } = request.body as any

		if(fastify.rooms.has(room_id)) return reply.code(409).send({ error: { room_id: `Room ${room_id} already exists`} })

		const room = new Room(room_id)
		await room.init(fastify.worker)
		fastify.rooms.set(room.id, room)

		if(userId){
			const users = await room.addUser(userId, userInfo)
			return { roomId: room.id, userId, users, userInfo }
		}

		return { room_id: room.id }
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

	fastify.register(roomRoutes, { prefix: "/rooms/:room_id" })
	fastify.register(userRoutes, { prefix: "/rooms/:room_id/users/:user_id" })

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