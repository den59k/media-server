import { types } from 'mediasoup'

const transportOptions = {
	listenIps : [ { ip: "0.0.0.0", announcedIp: process.env.PUBLIC_IP || "192.168.0.100" } ],
	enableUdp : process.env.ENABLE_UDP? (process.env.ENABLE_UDP === 'true'): true,
	enableTcp : process.env.ENABLE_TCP? (process.env.ENABLE_TCP === 'true'): true,
	preferUdp : true
}

class User {

	id: string
	produceTransport: types.WebRtcTransport
	consumeTransport: types.WebRtcTransport
	producers: types.Producer[]
	consumers: types.Consumer[]

	constructor(id: string){
		this.id = id
		this.producers = []
		this.consumers = []
	}

	async init(router: types.Router){
		this.consumeTransport = await router.createWebRtcTransport(transportOptions)
		this.consumeTransport.on("dtlsstatechange", state => console.log(`receiver ${this.id} DTLS state changed to ${state}`))
		const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } = this.consumeTransport

		return {
			consumeTransport: { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters }
		}
	}

	async confirmConsumeTransport ({dtlsParameters}){
		await this.consumeTransport.connect({ dtlsParameters })
	}

	async confirmProduceTransport ({dtlsParameters}){
		await this.produceTransport.connect({dtlsParameters})
	}

	async createProduceTransport (router: types.Router){
		this.produceTransport = await router.createWebRtcTransport(transportOptions)
		this.produceTransport.on("dtlsstatechange", state => console.log(`sender ${this.id} DTLS state changed to ${state}`))

		return this.produceTransport
	}
	
	async produce(produceOptions: types.ProducerOptions[]){
		for(let options of produceOptions){
			const producer = await this.produceTransport.produce(options)
			this.producers.push(producer)

			//await producer.enableTraceEvent([ "rtp", "pli" ]);
			producer.on('trace', trace => console.log(trace))
		}
		return this.producers
	}

	async addConsumers (user: User, router: types.Router){

		for(let producer of user.producers){
			const consumer = await this.consumeTransport.consume({
				producerId: producer.id,
				rtpCapabilities: router.rtpCapabilities,
				paused: true
			})
			//await consumer.enableTraceEvent([ "rtp", "pli" ]);
	 		consumer.on('trace', trace => console.log(trace.info.sequenceNumber + " packet with payload " + trace.info.payloadType))
			this.consumers.push(consumer) 
		}

		return this.consumers
	}

	async resumeConsumers (){
		for(let consumer of this.consumers)
			await consumer.resume()
	}

}

export default User