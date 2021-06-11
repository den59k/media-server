import { FastifySchema } from "fastify";

type schemaName = 'body' | 'params' | 'querystring' | 'headers'

export default function getSchema (body: any, key: schemaName = 'body'): FastifySchema {
	if(!body.type) body.type = 'object'
	
	const schema = {
		[key]: body
	}

	return schema
}