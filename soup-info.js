`
type: offer, sdp: v=0
o=mediasoup-client 10000 2 IN IP4 0.0.0.0
s=-
t=0 0
a=ice-lite
a=fingerprint:sha-512 51:07:B6:4E:B2:A3:D8:1D:87:97:83:C2:3E:BD:71:1B:D6:D2:16:BF:F5:E7:FE:89:EC:5B:05:E3:6B:76:99:02:61:3A:B9:58:39:FC:25:DB:A0:FD:2A:31:3C:45:6E:09:8F:75:06:CB:64:27:53:22:01:77:4E:BC:6A:56:E3:9E
a=msid-semantic: WMS *
a=group:BUNDLE 0 1
m=audio 7 UDP/TLS/RTP/SAVPF 100
c=IN IP4 127.0.0.1
a=rtpmap:100 opus/48000/2
a=fmtp:100 maxplaybackrate=48000;stereo=1;useinbandfec=1
a=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:4 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:10 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=setup:actpass
a=mid:0
a=msid:{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7} bfcd00c3-4739-4170-bc69-95b0c84960a7
a=sendonly
a=ice-ufrag:z6l78u4yd234v7fq
a=ice-pwd:d4v5e4mo341a55hwq5cu3dj9kxaryu6x
a=candidate:udpcandidate 1 udp 1076558079 192.168.0.100 56433 typ host
a=candidate:tcpcandidate 1 tcp 1076302079 192.168.0.100 47068 typ host tcptype passive
a=end-of-candidates
a=ice-options:renomination
a=ssrc:939503186 cname:{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7}
a=rtcp-mux
a=rtcp-rsize
m=video 7 UDP/TLS/RTP/SAVPF 101 102
c=IN IP4 127.0.0.1
a=rtpmap:101 VP8/90000
a=rtpmap:102 rtx/90000
a=fmtp:101 profile-level-id=42;level-asymmetry-allowed=1;packetization-mode=1
a=fmtp:102 apt=101
a=rtcp-fb:101 nack 
a=rtcp-fb:101 nack pli
a=rtcp-fb:101 ccm fir
a=rtcp-fb:101 transport-cc 
a=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:4 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:5 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:6 http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07
a=extmap:7 urn:ietf:params:rtp-hdrext:framemarking
a=extmap:11 urn:3gpp:video-orientation
a=extmap:12 urn:ietf:params:rtp-hdrext:toffset
a=setup:actpass
a=mid:1
a=msid:{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7} 1b6ef047-cdf1-47be-b0fb-0f9c87447bf1
a=sendonly
a=ice-ufrag:z6l78u4yd234v7fq
a=ice-pwd:d4v5e4mo341a55hwq5cu3dj9kxaryu6x
a=candidate:udpcandidate 1 udp 1076558079 192.168.0.100 56433 typ host
a=candidate:tcpcandidate 1 tcp 1076302079 192.168.0.100 47068 typ host tcptype passive
a=end-of-candidates
a=ice-options:renomination
a=ssrc:665943757 cname:{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7}
a=ssrc:665943758 cname:{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7}
a=ssrc-group:FID 665943757 665943758
a=rtcp-mux
a=rtcp-rsize
`


const resp = {
	"origin": {
			"username": "mediasoup-client",
			"sessionId": 10000,
			"sessionVersion": 2,
			"netType": "IN",
			"ipVer": 4,
			"address": "0.0.0.0"
	},
	"name": "-",
	"timing": {
			"start": 0,
			"stop": 0
	},
	"icelite": "ice-lite",
	"fingerprint": {
			"type": "sha-512",
			"hash": "51:07:B6:4E:B2:A3:D8:1D:87:97:83:C2:3E:BD:71:1B:D6:D2:16:BF:F5:E7:FE:89:EC:5B:05:E3:6B:76:99:02:61:3A:B9:58:39:FC:25:DB:A0:FD:2A:31:3C:45:6E:09:8F:75:06:CB:64:27:53:22:01:77:4E:BC:6A:56:E3:9E"
	},
	"msidSemantic": {
			"semantic": "WMS",
			"token": "*"
	},
	"groups": [
			{
					"type": "BUNDLE",
					"mids": "0 1"
			}
	],
	"media": [
			{
					"rtp": [
							{
									"payload": 100,
									"codec": "opus",
									"rate": 48000,
									"encoding": 2
							}
					],
					"fmtp": [
							{
									"payload": 100,
									"config": "maxplaybackrate=48000;stereo=1;useinbandfec=1"
							}
					],
					"type": "audio",
					"port": 7,
					"protocol": "UDP/TLS/RTP/SAVPF",
					"payloads": 100,
					"connection": {
							"version": 4,
							"ip": "127.0.0.1"
					},
					"ext": [
							{
									"value": 1,
									"uri": "urn:ietf:params:rtp-hdrext:sdes:mid"
							},
							{
									"value": 4,
									"uri": "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time"
							},
							{
									"value": 10,
									"uri": "urn:ietf:params:rtp-hdrext:ssrc-audio-level"
							}
					],
					"setup": "actpass",
					"mid": 0,
					"msid": "{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7} bfcd00c3-4739-4170-bc69-95b0c84960a7",
					"direction": "sendonly",
					"iceUfrag": "z6l78u4yd234v7fq",
					"icePwd": "d4v5e4mo341a55hwq5cu3dj9kxaryu6x",
					"candidates": [
							{
									"foundation": "udpcandidate",
									"component": 1,
									"transport": "udp",
									"priority": 1076558079,
									"ip": "192.168.0.100",
									"port": 56433,
									"type": "host"
							},
							{
									"foundation": "tcpcandidate",
									"component": 1,
									"transport": "tcp",
									"priority": 1076302079,
									"ip": "192.168.0.100",
									"port": 47068,
									"type": "host",
									"tcptype": "passive"
							}
					],
					"endOfCandidates": "end-of-candidates",
					"iceOptions": "renomination",
					"ssrcs": [
							{
									"id": 939503186,
									"attribute": "cname",
									"value": "{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7}"
							}
					],
					"rtcpMux": "rtcp-mux",
					"rtcpRsize": "rtcp-rsize"
			},
			{
					"rtp": [
							{
									"payload": 101,
									"codec": "VP8",
									"rate": 90000
							},
							{
									"payload": 102,
									"codec": "rtx",
									"rate": 90000
							}
					],
					"fmtp": [
							{
									"payload": 101,
									"config": "profile-level-id=42;level-asymmetry-allowed=1;packetization-mode=1"
							},
							{
									"payload": 102,
									"config": "apt=101"
							}
					],
					"type": "video",
					"port": 7,
					"protocol": "UDP/TLS/RTP/SAVPF",
					"payloads": "101 102",
					"connection": {
							"version": 4,
							"ip": "127.0.0.1"
					},
					"rtcpFb": [
							{
									"payload": 101,
									"type": "nack",
									"subtype": ""
							},
							{
									"payload": 101,
									"type": "nack",
									"subtype": "pli"
							},
							{
									"payload": 101,
									"type": "ccm",
									"subtype": "fir"
							},
							{
									"payload": 101,
									"type": "transport-cc",
									"subtype": ""
							}
					],
					"ext": [
							{
									"value": 1,
									"uri": "urn:ietf:params:rtp-hdrext:sdes:mid"
							},
							{
									"value": 4,
									"uri": "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time"
							},
							{
									"value": 5,
									"uri": "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01"
							},
							{
									"value": 6,
									"uri": "http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07"
							},
							{
									"value": 7,
									"uri": "urn:ietf:params:rtp-hdrext:framemarking"
							},
							{
									"value": 11,
									"uri": "urn:3gpp:video-orientation"
							},
							{
									"value": 12,
									"uri": "urn:ietf:params:rtp-hdrext:toffset"
							}
					],
					"setup": "actpass",
					"mid": 1,
					"msid": "{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7} 1b6ef047-cdf1-47be-b0fb-0f9c87447bf1",
					"direction": "sendonly",
					"iceUfrag": "z6l78u4yd234v7fq",
					"icePwd": "d4v5e4mo341a55hwq5cu3dj9kxaryu6x",
					"candidates": [
							{
									"foundation": "udpcandidate",
									"component": 1,
									"transport": "udp",
									"priority": 1076558079,
									"ip": "192.168.0.100",
									"port": 56433,
									"type": "host"
							},
							{
									"foundation": "tcpcandidate",
									"component": 1,
									"transport": "tcp",
									"priority": 1076302079,
									"ip": "192.168.0.100",
									"port": 47068,
									"type": "host",
									"tcptype": "passive"
							}
					],
					"endOfCandidates": "end-of-candidates",
					"iceOptions": "renomination",
					"ssrcs": [
							{
									"id": 665943757,
									"attribute": "cname",
									"value": "{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7}"
							},
							{
									"id": 665943758,
									"attribute": "cname",
									"value": "{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7}"
							}
					],
					"ssrcGroups": [
							{
									"semantics": "FID",
									"ssrcs": "665943757 665943758"
							}
					],
					"rtcpMux": "rtcp-mux",
					"rtcpRsize": "rtcp-rsize"
			}
	]
}



[
	{
			"id": "bfcd00c3-4739-4170-bc69-95b0c84960a7",
			"producerId": "14e91d2a-21ef-4cdc-9e19-742dd5caf27b",
			"kind": "audio",
			"rtpParameters": {
					"codecs": [
							{
									"mimeType": "audio/opus",
									"payloadType": 100,
									"clockRate": 48000,
									"channels": 2,
									"parameters": {
											"maxplaybackrate": 48000,
											"stereo": 1,
											"useinbandfec": 1
									},
									"rtcpFeedback": []
							}
					],
					"headerExtensions": [
							{
									"uri": "urn:ietf:params:rtp-hdrext:sdes:mid",
									"id": 1,
									"encrypt": false,
									"parameters": {}
							},
							{
									"uri": "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
									"id": 4,
									"encrypt": false,
									"parameters": {}
							},
							{
									"uri": "urn:ietf:params:rtp-hdrext:ssrc-audio-level",
									"id": 10,
									"encrypt": false,
									"parameters": {}
							}
					],
					"encodings": [
							{
									"ssrc": 939503186
							}
					],
					"rtcp": {
							"cname": "{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7}",
							"reducedSize": true,
							"mux": true
					},
					"mid": "0"
			}
	},
	{
			"id": "1b6ef047-cdf1-47be-b0fb-0f9c87447bf1",
			"producerId": "9a1aa120-7455-4e54-adca-8f2f72413873",
			"kind": "video",
			"rtpParameters": {
					"codecs": [
							{
									"mimeType": "video/VP8",
									"payloadType": 101,
									"clockRate": 90000,
									"parameters": {
											"profile-level-id": 42,
											"level-asymmetry-allowed": 1,
											"packetization-mode": 1
									},
									"rtcpFeedback": [
											{
													"type": "nack",
													"parameter": ""
											},
											{
													"type": "nack",
													"parameter": "pli"
											},
											{
													"type": "ccm",
													"parameter": "fir"
											},
											{
													"type": "transport-cc",
													"parameter": ""
											}
									]
							},
							{
									"mimeType": "video/rtx",
									"payloadType": 102,
									"clockRate": 90000,
									"parameters": {
											"apt": 101
									},
									"rtcpFeedback": []
							}
					],
					"headerExtensions": [
							{
									"uri": "urn:ietf:params:rtp-hdrext:sdes:mid",
									"id": 1,
									"encrypt": false,
									"parameters": {}
							},
							{
									"uri": "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
									"id": 4,
									"encrypt": false,
									"parameters": {}
							},
							{
									"uri": "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
									"id": 5,
									"encrypt": false,
									"parameters": {}
							},
							{
									"uri": "http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07",
									"id": 6,
									"encrypt": false,
									"parameters": {}
							},
							{
									"uri": "urn:ietf:params:rtp-hdrext:framemarking",
									"id": 7,
									"encrypt": false,
									"parameters": {}
							},
							{
									"uri": "urn:3gpp:video-orientation",
									"id": 11,
									"encrypt": false,
									"parameters": {}
							},
							{
									"uri": "urn:ietf:params:rtp-hdrext:toffset",
									"id": 12,
									"encrypt": false,
									"parameters": {}
							}
					],
					"encodings": [
							{
									"ssrc": 665943757,
									"rtx": {
											"ssrc": 665943758
									}
							}
					],
					"rtcp": {
							"cname": "{099fc326-57ea-4f1a-bbe5-ee1edf2ae9f7}",
							"reducedSize": true,
							"mux": true
					},
					"mid": "1"
			}
	}
]

