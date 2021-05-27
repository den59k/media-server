import type { FastifyInstance } from "fastify"
import { types } from 'mediasoup'
import Room from '../../room/index'

export interface AppFastifyInstance extends FastifyInstance {
	worker: types.Worker,
	rooms: Map<string, Room>
}