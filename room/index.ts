import { getSupportedRtpCapabilities, types } from 'mediasoup'
import { generateAnswer, generateOffer } from '../libs/sdp'
import mediaCodecs from './codecs'
import Connector from './connector'

import sdpTransform from 'sdp-transform'
import { getDtlsParameters, getProduceOptions } from '../libs/parse-sdp'
import delay from '../libs/delay'


class Room {

	id: string
	router: types.Router

	users: Map<string, any>
	connectors: Map<string, Connector>
	
	constructor (room_id?: string){
		if(room_id)
			this.id = room_id
		this.users = new Map()
		this.connectors = new Map()
	}

	async init (worker: types.Worker){
		const router = await worker.createRouter({ mediaCodecs })
		this.router = router
		if(!this.id) this.id = router.id
		this.connectors = new Map()
	}

	async addUser(user_id: string, userInfo?: any){
		this.users.set(user_id, userInfo)
		const users = []
		for(let [ id, userInfo ] of this.users){
			if(id === user_id) continue;
			const connector = this.connectors.get(id)
			if(!connector){
				users.push({ id, userInfo })
				continue;
			}
			const consumers = await connector.consumeUser(user_id)
			users.push({
				offer: { sdp: generateOffer(connector.consumeTransports.get(user_id), consumers), type: "offer" },
				constraints: connector.getConstraints(),
				id,
				userInfo
			})
		}
		return users
	}

	async produce(user_id: string, sdp: string, constraints: any){
		
		//Если мы не отправляем SDP, то в этом случае обновляем Constraints
		if(!sdp){
			if(!constraints) return
			let connector = this.connectors.get(user_id)
			if(!connector) return
			connector.updateConstraints(constraints)
			return {
				constraints,
				id: user_id,
				userInfo: this.users.get(user_id),
				outbound: this._getOutbound([ user_id ]),
			}
		}

		const _sdp = sdpTransform.parse(sdp)
		const produceOptions = getProduceOptions(_sdp)
		const dtlsParameters = getDtlsParameters(_sdp)
		
		let connector = this.connectors.get(user_id)
		if(!connector){
			connector = new Connector(this.router)
			this.connectors.set(user_id, connector)
			await connector.produce(produceOptions, constraints)
			await connector.produceTransport.connect({ dtlsParameters })
		}else{
			await connector.produce(produceOptions, constraints)
		}

		//Мы должны сразу же пробросить producer во все consumer
		const outbound = []
		for(let key of this.users.keys()){
			if(key === user_id) continue

			const consumers = await connector.consumeUser(key)
			outbound.push({ 
				id: key,
				userInfo: this.users.get(key),
				offer: { sdp: generateOffer(connector.consumeTransports.get(key), consumers), type: "offer" }
			})
		}

		return {
			answer: { sdp: generateAnswer(connector.produceTransport, connector.getProducers()), type: "answer" },
			id: user_id,
			userInfo: this.users.get(user_id),
			constraints: connector.getConstraints(),
			outbound,
		}
	}

	stopProduce(user_id: string){
		this.connectors.get(user_id).close()
		this.connectors.delete(user_id)
		const outbound = this._getOutbound([user_id])
		return { 
			outbound, 
			id: user_id, 
			userInfo: this.users.get(user_id),
			constraints: { audio: false, video: false }
		}
	}

	async confirmConsumeTransport (user_id: string, id: string, sdp: string){

		const connector = this.connectors.get(id)
		if(!connector) return
		
		if(connector.consumeTransports.get(user_id).dtlsState !== 'connected'){
			const _sdp = sdpTransform.parse(sdp)
			const dtlsParameters = getDtlsParameters(_sdp)

			await connector.consumeTransports.get(user_id).connect({ dtlsParameters })
		}
		
		await delay(150)
		for(let consumers of connector.consumers.values()){
			const consumer = consumers.get(user_id)
			await consumer.resume()
		}
	}

	deleteUser(user_id: string){

		const user = this.users.get(user_id)
		if(!user) return

		for(let connector of this.connectors.values())
			connector.removeUser(user_id)

		if(this.connectors.has(user_id)){
			this.connectors.get(user_id).close()
			this.connectors.delete(user_id)
			return { id: user_id, removePc: true }
		}

		this.users.delete(user_id)
		const outbound = this._getOutbound([user_id])

		return { id: user_id, userInfo: user, outbound }
	}

	_getOutbound(exclude: Array<string>){
		const outbound = []
		for(let key of this.users.keys()){
			if(exclude.includes(key)) continue
			outbound.push({ id: key, userInfo: this.users.get(key) })
		}
		return outbound
	}

	async getUsersStats(){
		const arr = []
		for(let key of this.users.keys()){
			const consumeTransportStats: Array<types.WebRtcTransportStat> = []
			for(let connector of this.connectors.values())
				if(connector.consumeTransports.has(key))
					consumeTransportStats.push((await connector.consumeTransports.get(key).getStats())[0])

			const obj = {
				id: key,
				userInfo: this.users.get(key),
				produce: this.connectors.has(key) && {
					producerCount: this.connectors.get(key).producers.size,
					bytesReceived: (await this.connectors.get(key).produceTransport.getStats())[0].bytesReceived
				},
				consume: {
					consumeTransportCount: consumeTransportStats.length,
					bytesSent: consumeTransportStats.reduce((sum, val) => sum + val.bytesSent, 0)
				}
			}
			arr.push(obj)
		}
		return arr
	}

	dispose(){
		this.router.close()
	}
}

export default Room