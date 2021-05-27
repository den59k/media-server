import { getSupportedRtpCapabilities, types } from 'mediasoup'
import mediaCodecs from './codecs'
import User from './user'

class Room {

	id: string
	router: types.Router
	users: Map<string, User>
	
	async init (worker: types.Worker){
		const router = await worker.createRouter({ mediaCodecs })
		this.router = router
		this.id = router.id
		this.users = new Map()
	}

	
	async addUser(user_id: string){
		const user = new User(user_id)
		this.users.set(user_id, user)
		await user.init(this.router)
		return user
	}
	
	// async createTransport (incoming: boolean){
		// 	const transport = await this.router.createWebRtcTransport({
	// 		listenIps : [ { ip: "0.0.0.0", announcedIp: "192.168.0.100" } ],
	// 		enableUdp : true,
	// 		enableTcp : true,
	// 		preferUdp : true
	// 	})

	// 	transport.on("icestatechange", state => console.log((incoming?"receiver": "sender") + " ICE state changed to "+state))
	// 	transport.on("dtlsstatechange", state => console.log((incoming?"receiver": "sender") + " DTLS state changed to "+state))

	// 	this.transports.set(transport.id, transport)
	// 	const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } = transport
	// 	return { 
	// 		transportData :{ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters },
	// 		routerRtpCapabilities: this.router.rtpCapabilities
	// 	}
	// }

	// async confirmTransport (transport_id: string, dtlsParameters: types.DtlsParameters){
	// 	const transport = this.transports.get(transport_id)
	// 	await transport.connect({ dtlsParameters })
	// }

	// async createProducer (transport_id: string, options: types.ProducerOptions){
	// 	const transport = this.transports.get(transport_id)
	// 	const producer = await transport.produce(options)
	// 	this.producers.set(producer.id, producer)

	// 	//await producer.enableTraceEvent([ "rtp", "pli" ]);
	// 	producer.on('trace', trace => console.log(trace))

	// 	return { id: producer.id }
	// }

	// async createProducers (transport_id: string, producersData: types.ProducerOptions[]){
	// 	const transport = this.transports.get(transport_id)

	// 	const producers = []
	// 	for(let producerData of producersData){
	// 		const producer = await transport.produce(producerData)
	// 		this.producers.set(producer.id, producer)
	// 		producers.push({ id: producer.id })
	// 	}
		
	// 	return producers
	// }

	// async createConsumers (transport_id: string){
	// 	const transport = this.transports.get(transport_id)

	// 	const consumers: types.Consumer[] = []
	// 	for(let producer of this.producers.values()){
	// 		const consumer = await transport.consume({
	// 			producerId: producer.id,
	// 			rtpCapabilities: this.router.rtpCapabilities,
	// 			paused: true
	// 		})

	// 		await consumer.enableTraceEvent([ "rtp", "pli" ]);
	// 		consumer.on('trace', trace => console.log(trace))

	// 		consumers.push(consumer)
	// 	}

	// 	const consumersData = consumers.map(({ id, producerId, kind, rtpParameters }) => ({ id, producerId, kind, rtpParameters })) 
	// 	this.consumers.set(transport_id, consumers)

	// 	return consumersData
	// }

	// async resumeConsume (transport_id: string){
	// 	const consumers = this.consumers.get(transport_id)
	// 	for(let consumer of consumers){
	// 		await consumer.resume()
	// 	}
	// }
}

export default Room