import { types } from 'mediasoup'
import sdpTransform, { SharedAttributes } from 'sdp-transform'
import { MediaDescription } from 'sdp-transform'

interface Description extends MediaDescription {
	type: string;
	port: number;
	protocol: string;
	payloads?: string;
}

function getRTCPFeedback (codecs: types.RtpCodecParameters[]){
	const arr = []
	for(let codec of codecs){
		arr.push(...codec.rtcpFeedback.map(rtcp => ({
			payload: codec.payloadType,
			type: rtcp.type,
			subtype: rtcp.parameter
		})))
	}

	return arr
}

function producerToMedia(transport: types.WebRtcTransport, producer: types.Producer | types.Consumer): Description {

	const obj: Description = ({
		rtp: producer.rtpParameters.codecs.map(codec => ({
			payload: codec.payloadType,
			codec: codec.mimeType.split("/")[1],
			rate: codec.clockRate,
			encoding: codec.channels
		})),
		fmtp: producer.rtpParameters.codecs.map(codec => ({
			payload: codec.payloadType,
			config: Object.keys(codec.parameters).map(key => key+"="+codec.parameters[key]).join(";")
		})).filter(item => item.config !== ''),
		type: producer.kind,
		port: 7,
		protocol: 'UDP/TLS/RTP/SAVPF',
		payloads: producer.rtpParameters.codecs.map(codec => codec.payloadType).join(" "),
		connection: { version: 4, ip: '127.0.0.1' },
		iceUfrag: transport.iceParameters.usernameFragment,
		icePwd: transport.iceParameters.password,
		mid: producer.rtpParameters.mid,
		setup: transport.dtlsParameters.role === 'client'? 'active': 'actpass',
		rtcpMux: 'rtcp-mux',
		rtcpFb: getRTCPFeedback(producer.rtpParameters.codecs),
		ssrcs: producer.rtpParameters.encodings[0].ssrc && [{
				id: producer.rtpParameters.encodings[0].ssrc,
				attribute: "cname",
				value: producer.rtpParameters.rtcp.cname
		}],
		msid: producer.rtpParameters.rtcp.cname + " " + producer.id,
		candidates: transport.iceCandidates.map(candidate => ({
			foundation: candidate.foundation,
			component: 1,
			transport: candidate.protocol,
			priority: candidate.priority,
			ip: candidate.ip,
			port: candidate.port,
			type: candidate.type,
			tcptype: candidate.tcpType,
		})),
		endOfCandidates: "end-of-candidates",
		ext: producer.rtpParameters.headerExtensions.map(item => ({
			value: item.id,
			uri: item.uri
		})),
		rtcpRsize: 'rtcp-rsize'
	}) 

	if(producer.rtpParameters.encodings[0].rtx){
		obj.ssrcs.push({
			id: producer.rtpParameters.encodings[0].rtx.ssrc,
			attribute: "cname",
			value: producer.rtpParameters.rtcp.cname
		})

		obj.ssrcGroups = [{
			semantics: "FID",
			ssrcs: obj.ssrcs.map(item => item.id).join(" ")
		}]
	}
	
	return obj
}

export function generateOffer (transport: types.WebRtcTransport, consumers: types.Consumer[]){

	const fingerprint = transport.dtlsParameters.fingerprints[transport.dtlsParameters.fingerprints.length-1]

	return sdpTransform.write({
		version: 0,
		origin: {
			username: 'den',
			sessionId: '3497579305088229251',
			sessionVersion: 2,
			netType: 'IN',
			ipVer: 4,
			address: '0.0.0.0',
		},
		name: '-',
		timing: { start: 0, stop: 0 },
		groups: [ { type: 'BUNDLE', mids: consumers.map((_, index) => index).join(' ')  } ],
		fingerprint:{
			type: fingerprint.algorithm,
			hash: fingerprint.value
		},
		setup: transport.dtlsParameters.role === 'client'? 'active': 'actpass',
		iceOptions: 'renomination',
		icelite: 'ice-lite',
		msidSemantic: { semantic: 'WMS', token: '*' },
		direction: "sendonly",
		media: consumers.map(consumer => producerToMedia(transport, consumer))
	})

}


export function generateAnswer (transport: types.WebRtcTransport, producers: types.Producer[]){
	return sdpTransform.write({
		version: 0,
		origin: {
			username: 'den',
			sessionId: '3497579305088229251',
			sessionVersion: 2,
			netType: 'IN',
			ipVer: 4,
			address: '127.0.0.1',
		},
		name: '-',
		timing: { start: 0, stop: 0 },
		groups: [ { type: 'BUNDLE', mids: producers.map((_, index) => index).join(' ')  } ],
		fingerprint:{
			type: transport.dtlsParameters.fingerprints[0].algorithm,
			hash: transport.dtlsParameters.fingerprints[0].value
		},
		setup: transport.dtlsParameters.role === 'client'? 'active': 'actpass',
		iceOptions: 'renomination',
		icelite: 'ice-lite',
		msidSemantic: { semantic: 'WMS', token: '*' },
		direction: "recvonly",
		media: producers.map(producer => producerToMedia(transport, producer)),
	})
}