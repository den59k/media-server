import { types } from 'mediasoup'
import * as sdpTransform from 'sdp-transform';
import * as crypto from 'crypto'

interface options {
	transport: types.WebRtcTransport , 
	mediaCodecs: any[]
}

async function connect (sdp: sdpTransform.SessionDescription, transport: types.WebRtcTransport){
	const fingerprint = sdp.fingerprint || sdp.media[0].fingerprint
	const setup = sdp.media[0].setup

	const dtlsParameters: types.DtlsParameters = {
		role: setup === 'active'? 'client': 'server',
		fingerprints:
		[
			{
				algorithm: fingerprint.type,
				value: fingerprint.hash
			}
		]
	}

	await transport.connect({ dtlsParameters });
}

export async function connectProducers (transport: types.Transport, producers: types.Producer[]){
	const consumers: types.Consumer[] = []
	for(let producer of producers){

		const consumer = await transport.consume({
			producerId: producer.id,
			rtpCapabilities: {
				codecs: [
					// {
					// 	mimeType             : producer.rtpParameters.codecs[0].mimeType,
					// 	kind                 : producer.kind,
					// 	clockRate            : producer.rtpParameters.codecs[0].clockRate,
					// 	preferredPayloadType : producer.rtpParameters.codecs[0].payloadType,
					// 	channels             : producer.rtpParameters.codecs[0].channels,
					// 	rtcpFeedback: producer.rtpParameters.codecs[0].rtcpFeedback
					// },
				
					{
						kind        : "audio",
						mimeType    : "audio/opus",
						clockRate   : 48000,
						preferredPayloadType: 111,
						channels    : 2
					},
					{
						kind       : "video",
						mimeType   : "video/VP8",
						clockRate  : 90000,
						preferredPayloadType: 96,
						rtcpFeedback: [
							{ type: "nack" },
							{ type: "nack", parameter: "pli" },
							{ type: "ccm", parameter: "fir" },
							{ type: "goog-remb" }
						]
					}
				],
				headerExtensions: []
			},
			paused: true
		})
		consumer.rtpParameters.codecs[0].payloadType = producer.rtpParameters.codecs[0].payloadType
		consumers.push(consumer)
		await consumer.enableTraceEvent([ "rtp" ]);
		consumer.on('trace', trace => console.log(trace))
	}

	for(let consumer of consumers){
		await consumer.resume()
	}

	return consumers
}

export async function connectOutcoming (body, { transport }: options, producers: types.Producer[]) {
	const { offer } = body
	const sdp = sdpTransform.parse(offer.sdp)

	await connect(sdp, transport)
	
	const consumers = await connectProducers(transport, producers)
	return consumers
}

export async function connectIncoming (body, { transport }: options){
	const { offer } = body
	const sdp = sdpTransform.parse(offer.sdp)
	await connect(sdp, transport)
	
	const producers = []

	for(let media of sdp.media){
		const producer = await transport.produce({
			kind: media.type === 'audio'? 'audio': 'video',
			rtpParameters: {
				mid: media.mid.toString(),
				codecs: [{
					mimeType: media.type+"/"+media.rtp[0].codec,
					payloadType: media.rtp[0].payload,
					clockRate: media.rtp[0].rate,
					channels: media.rtp[0].encoding,
					rtcpFeedback: media.rtcpFb? media.rtcpFb.map(fb => ({ type: fb.type, parameter: fb.subtype })): undefined
				}],
				encodings: [{
					ssrc: media.ssrcs[0].id as number,
				}],
				rtcp: { cname: media.ssrcs.find(i => i.attribute === 'cname').value, reducedSize: true }
			}
		})

		await producer.enableTraceEvent([ "rtp", "pli" ]);
		producer.on('trace', trace => console.log(trace))
		producers.push(producer)
	}

	return producers
}