import type { FastifyInstance } from "fastify"
import { types } from 'mediasoup'
import Room from '../../room/index'

declare module 'fastify' {

	interface FastifyInstance {
		worker: types.Worker,
		rooms: Map<string, Room>
	}

	interface FastifyRequest {
    room?: Room	
		user_id?: string
  }

}