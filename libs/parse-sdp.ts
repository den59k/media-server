import { types } from 'mediasoup';
import { SessionDescription } from 'sdp-transform'

const sdpSetup = {
	'active': 'client',
	'passive': 'server',
	'actpass': 'auto'
}

export function getDtlsParameters (sdp: SessionDescription): types.DtlsParameters {

	const fingerprint = sdp.fingerprint || sdp.media[0].fingerprint

	return {
		role: sdpSetup[sdp.setup || sdp.media[0].setup],
		fingerprints: [
			{
				algorithm: fingerprint.type,
				value: fingerprint.hash
			}
		]
	}
}

function getParameters(fmtp){
	if(!fmtp) return undefined

	const obj = {}

	for(let item of fmtp.config.split(";")){
		const splited = item.split("=")
		obj[splited[0]] = parseInt(splited[1])
	}

	return obj
}

function filterRtp (rtp: any){
	return rtp.codec === 'VP8' || rtp.codec === 'opus'
}

export function getProduceOptions (sdp: SessionDescription): types.ProducerOptions[]{
	return sdp.media.filter(m => (m.type === 'video' || m.type === 'audio')).map(media => ({
		kind: media.type === 'video'? 'video': 'audio',
		rtpParameters: {
			mid: media.mid.toString(),
			codecs: media.rtp.filter(filterRtp).map(rtp => ({
				mimeType: media.type+"/"+rtp.codec,
				payloadType: rtp.payload,
				clockRate: rtp.rate,
				channels: rtp.encoding,
				parameters: getParameters(media.fmtp.find(i => i.payload)),
				rtcpFeedback: (media.rtcpFb || []).filter(i => i.payload === rtp.payload).map(item => ({
					type: item.type,
					parameter: item.subtype
				}))
			})),
			headerExtensions: [],
			encodings: [{
				ssrc: media.ssrcs[0].id as number,
				dtx: false
			}],
			rtcp: { cname: media.ssrcs.find(i => i.attribute === 'cname').value, reducedSize: true }
		}
	}))
}