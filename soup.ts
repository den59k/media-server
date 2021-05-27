import { WebRtcTransport } from "mediasoup/lib/WebRtcTransport";

export function getTransportParameters (transport: WebRtcTransport){
	return {
		id: transport.id,
		iceParameters: transport.iceParameters,
		iceCandidates: transport.iceCandidates,
		dtlsParameters: transport.dtlsParameters,
		sctpParameters: transport.sctpParameters
	}
}

export async function soupConnect (transport: WebRtcTransport, body: any){

	const { dtlsParameters, kind, rtpParameters } = body

	if(dtlsParameters){
		console.log(dtlsParameters)
		await transport.connect({dtlsParameters})

		return { status: "not yet" }
	}else{
		const producer = await transport.produce({
			kind,
			rtpParameters	
		})
		
		await producer.enableTraceEvent([ "rtp", "pli" ]);
		producer.on('trace', trace => console.log(trace))

		return { id: producer.id }
	}
}