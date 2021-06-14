import { getSupportedRtpCapabilities, types } from 'mediasoup'
import mediaCodecs from './codecs'
import User from './user'

class Room {

	id: string
	router: types.Router
	users: Map<string, User>
	
	constructor (room_id?: string){
		if(room_id)
			this.id = room_id
	}

	async init (worker: types.Worker){
		const router = await worker.createRouter({ mediaCodecs })
		this.router = router
		if(!this.id) this.id = router.id
		this.users = new Map()
	}

	
	async addUser(user_id: string){
		const user = new User(user_id)
		this.users.set(user_id, user)
		await user.init(this.router)
		return user
	}

	async addConsumersToUser (user_id: string){
		const user = this.users.get(user_id)
		
		for(let [ key, otherUser ] of this.users){
			if(key === user_id) continue
			await user.addConsumers(otherUser, this.router)
		}

		return user.consumers
	}


	deleteUser(user_id: string){
		const user = this.users.get(user_id)
		user.dispose()
		this.users.delete(user_id)
	}

	dispose(){
		for(let user of this.users.values())
			user.dispose()
		
		this.router.removeAllListeners()
		this.router.close()
	}
}

export default Room