import { createWorker, getSupportedRtpCapabilities } from 'mediasoup'
import { AppFastifyInstance } from '../types/fastify';
import mediaCodecs from './codecs'
import { nanoid } from 'nanoid'

import { getSDP } from '../webrtc-bridge/sdp'
import { connectIncoming, connectOutcoming, connectProducers } from '../webrtc-bridge/connect';

export default async function app (fastify: AppFastifyInstance){

	const worker = await createWorker({ logLevel: "debug"	})
	
	fastify.decorate("worker", worker)
	fastify.decorate("routers", new Map())
	fastify.decorate("transports", new Map())

	fastify.post("/create-room", async (request) => {
		const router = await worker.createRouter({ mediaCodecs })
		fastify.routers.set(router.id, { router, transports: new Map(), producers: new Map(), consumers: new Map() })
		return { id: router.id }
	})

	fastify.post("/create-transport/:room_id", async (request) => {
		const { room_id } = request.params as any
		const { incoming } = request.body as any
		const routerObj = fastify.routers.get(room_id)

		const transport = await routerObj.router.createWebRtcTransport({
			listenIps : [ { ip: "0.0.0.0", announcedIp: "192.168.0.100" } ],
			enableUdp : true,
			enableTcp : true,
			preferUdp : true
		})

		transport.on("icestatechange", state => console.log((incoming?"receiver": "sender") + " ICE state changed to "+state))
		transport.on("dtlsstatechange", state => console.log((incoming?"receiver": "sender") + " DTLS state changed to "+state))

		routerObj.transports.set(transport.id, transport) 

		return getSDP({ transport, mediaCodecs, incoming, producers: Array.from(routerObj.producers.values()) })
	})

	fastify.post("/confirm/:room_id", async (request) => {
		const { room_id } = request.params as any
		const { transport_id, candidates, offer, incoming } = request.body as any

		const routerObj = fastify.routers.get(room_id)

		if(incoming){
			const transport = routerObj.transports.get(transport_id)
			const producers = await connectIncoming({candidates, offer}, { transport, mediaCodecs })
			for(let producer of producers){
				const id = producer.id
				routerObj.producers.set(id, producer)
				producer.on('transportclose', () => routerObj.producers.delete(id))
			}

			return { status: "connected" }
		}else{
			const transport = routerObj.transports.get(transport_id)
			await connectOutcoming({ candidates, offer }, { transport, mediaCodecs }, Array.from(routerObj.producers.values()))

			return { status: "connected" }
		}
		
	})

	fastify.post("/crt/:room_id", async (request) => {
		const { room_id } = request.params as any
		const routerObj = fastify.routers.get(room_id)

		const transport = await routerObj.router.createWebRtcTransport({
			listenIps : [ { ip: "0.0.0.0", announcedIp: "192.168.0.100" } ],
			enableUdp : true,
			enableTcp : true,
			preferUdp : true
		})

		const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } = transport
		routerObj.transports.set(transport.id, transport) 

		transport.on("icestatechange", state => "$$$ ICE state changed to "+state)
		transport.on("dtlsstatechange", state => "$$$ DTLS state changed to "+state)

		const consumers = await connectProducers(transport, Array.from(routerObj.producers.values()))

		return { 
			transport: { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters }, 
			routerRtpCapabilities: getSupportedRtpCapabilities(), 
			consumers: consumers.map(consumer => ({
				id: consumer.id,
				producerId: consumer.producerId,
				kind: consumer.kind,
				rtpParameters: consumer.rtpParameters
			}))
		}
	})

	fastify.post("/cfm/:room_id", async (request) => {
		const { room_id } = request.params as any
		const { transportId, dtlsParameters } = request.body as any

		const routerObj = fastify.routers.get(room_id)
		const transport = routerObj.transports.get(transportId)

		await transport.connect({dtlsParameters})
		return { success: "success" }
	})

	fastify.setErrorHandler(function (error, _request, reply) {
		console.log(error)
		reply.status(500).send({ error: 'Ошибка сервера' })
	})

}