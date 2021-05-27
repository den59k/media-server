import * as http from 'http'

export function createHTTP (callbacks, port){
	http.createServer((req, res) => {

		let _body = ""
		req.on('data', chunk => _body += chunk.toString())

		req.on('end', async () => {
			const body = _body?JSON.parse(_body): null
			let response: any
			
			if(req.url in callbacks)
				response = await callbacks(body)

			res.setHeader("Access-Control-Allow-Origin", "*")
			res.setHeader("Access-Control-Allow-Methods", "*")
			res.setHeader("Access-Control-Allow-Headers", "*")
			res.setHeader("Content-Type", "application/json")
			res.write(JSON.stringify(response))
			res.end()
		})
	}).listen(5000)
}