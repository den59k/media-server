`
v=0
o=mediasoup-client 10000 1 IN IP4 0.0.0.0
s=-
t=0 0
a=ice-lite
a=fingerprint:sha-512 D7:52:C0:C7:0F:7E:0A:7A:DD:64:33:C7:FF:DF:F7:81:F2:E2:38:6D:B3:E5:BB:28:C3:A1:29:8E:04:F3:DF:DE:DE:C3:2D:0C:6A:23:A1:2F:13:82:C3:7E:5D:35:D2:EB:B1:6E:1A:AE:CB:35:1C:83:FB:EA:1A:4D:DE:A4:F0:50
a=msid-semantic: WMS *
a=group:BUNDLE 0
m=audio 7 UDP/TLS/RTP/SAVPF 111
c=IN IP4 127.0.0.1
a=rtpmap:111 opus/48000/2
a=setup:active
a=mid:0
a=recvonly
a=ice-ufrag:0t0k0vhs3tyomkfc
a=ice-pwd:q76aa1nypbsm8yhq7wf73eszikxf5fuj
a=candidate:udpcandidate 1 udp 1076558079 192.168.0.100 38289 typ host
a=candidate:tcpcandidate 1 tcp 1076302079 192.168.0.100 17834 typ host tcptype passive
a=end-of-candidates
a=ice-options:renomination
a=rtcp-mux
a=rtcp-rsize
`


const dtls = {
	"role": "server",
	"fingerprints": [
			{
					"algorithm": "sha-256",
					"value": "49:B8:6F:76:63:B9:61:7B:BA:5D:84:AA:24:81:0F:B0:8B:AE:5D:27:2E:24:BE:DB:50:88:C3:64:31:A8:7D:32"
			}
	]
}

const parameters = {
	"kind": "audio",
	"rtpParameters": {
			"codecs": [
					{
							"mimeType": "audio/opus",
							"payloadType": 111,
							"clockRate": 48000,
							"channels": 2,
							"parameters": {
									"minptime": 10,
									"useinbandfec": 1
							},
							"rtcpFeedback": []
					}
			],
			"headerExtensions": [],
			"encodings": [
					{
							"ssrc": 558745463,
							"dtx": false
					}
			],
			"rtcp": {
					"cname": "cuspG3GH3trhcBNg",
					"reducedSize": true
			},
			"mid": "0"
	},
	"appData": {}
}

`
type: offer, sdp: v=0
o=- 6000404073847333212 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS ab906b64-7970-489f-8820-463032f8d6ac
m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:laqL
a=ice-pwd:Owi0dcuwQxyiGgHtNPyEJ1t8
a=ice-options:trickle
a=fingerprint:sha-256 C3:F6:5C:23:E3:1D:E4:D1:6F:43:B1:5F:BA:ED:81:2D:1E:52:9D:23:D2:05:65:E2:9A:80:88:73:AA:A7:64:79
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=sendonly
a=msid:ab906b64-7970-489f-8820-463032f8d6ac 2050b232-c469-4b82-8080-650f28e05226
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:103 ISAC/16000
a=rtpmap:104 ISAC/32000
a=rtpmap:9 G722/8000
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:106 CN/32000
a=rtpmap:105 CN/16000
a=rtpmap:13 CN/8000
a=rtpmap:110 telephone-event/48000
a=rtpmap:112 telephone-event/32000
a=rtpmap:113 telephone-event/16000
a=rtpmap:126 telephone-event/8000
a=ssrc:852912663 cname:I5AD6mxr+PuAPfZF
a=ssrc:852912663 msid:ab906b64-7970-489f-8820-463032f8d6ac 2050b232-c469-4b82-8080-650f28e05226
a=ssrc:852912663 mslabel:ab906b64-7970-489f-8820-463032f8d6ac
a=ssrc:852912663 label:2050b232-c469-4b82-8080-650f28e05226
`