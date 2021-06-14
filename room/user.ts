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
	_producers: Map<string, types.Producer>
	_consumers: Map<string, types.Consumer>

	constructor(id: string){
		this.id = id
		this._producers = new Map()
		this._consumers = new Map()
	}

	get producers (){
		return Array.from(this._producers.values())
	}

	get consumers (){
		return Array.from(this._consumers.values())
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
			this._producers.set(producer.id, producer)
			//await producer.enableTraceEvent([ "rtp", "pli" ]);
			producer.on('trace', trace => console.log(trace))
		}
		
		return this._producers
	}

	async addConsumers (user: User, router: types.Router){

		for(let producer of user._producers.values()){
			const consumer = await this.consumeTransport.consume({
				producerId: producer.id,
				rtpCapabilities: router.rtpCapabilities,
				paused: true
			})
			const consumer_id = consumer.producerId	

			//await consumer.enableTraceEvent([ "rtp", "pli" ]);
	 		consumer.on('trace', trace => console.log(trace.info.sequenceNumber + " packet with payload " + trace.info.payloadType))
			this._consumers.set(consumer_id, consumer)
			
			//consumer.on("producerclose", () => this._consumers.delete(consumer_id))
		}

		return this._consumers
	}

	async resumeConsumers (){
		for(let consumer of this._consumers.values())
			await consumer.resume()
	}

	deleteConsumers (user: User){
		let count = 0;
		for(let key of this._consumers.keys())
			if(user._producers.has(key)){
				this._consumers.get(key).close()
				this._consumers.delete(key)
				count++
			}
		return count
	}

	dispose(){
		for(let consumer of this._consumers.values()){
			consumer.close()
			consumer.removeAllListeners()
		}
		for(let producer of this._producers.values()){
			producer.close()
			producer.removeAllListeners()
		}
		
		this.consumeTransport.close()
		this.consumeTransport.removeAllListeners()

		if(this.produceTransport){
			this.produceTransport.close()
			this.produceTransport.removeAllListeners()
		}
	}

}

export default User