"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSDP = void 0;
const sdpTransform = __importStar(require("sdp-transform"));
const crypto = __importStar(require("crypto"));
const getMedia = ({ pwd, ufrag }) => [
    {
        rtp: [
            { payload: 109, codec: 'opus', rate: 48000, encoding: 2 },
            { payload: 111, codec: 'opus', rate: 48000, encoding: 2 }
        ],
        fmtp: [
            { payload: 109, config: 'minptime=10;useinbandfec=1' },
            { payload: 111, config: 'minptime=10;useinbandfec=1' }
        ],
        type: 'audio',
        port: 9,
        protocol: 'UDP/TLS/RTP/SAVPF',
        payloads: '109 111',
        connection: { version: 4, ip: '0.0.0.0' },
        ext: [],
        icePwd: pwd,
        iceUfrag: ufrag,
        mid: '0',
        setup: 'active',
        direction: 'recvonly',
        rtcpMux: 'rtcp-mux',
    },
    {
        rtp: [
            { payload: 120, codec: 'VP8', rate: 90000 },
            { payload: 96, codec: 'VP8', rate: 90000 }
        ],
        fmtp: [],
        type: 'video',
        port: 9,
        protocol: 'UDP/TLS/RTP/SAVPF',
        payloads: '96 120',
        connection: { version: 4, ip: '0.0.0.0' },
        ext: [],
        icePwd: pwd,
        iceUfrag: ufrag,
        setup: 'active',
        mid: '1',
        rtcpFb: [
            { payload: 120, type: 'nack' },
            { payload: 120, type: 'nack', subtype: 'pli' },
            { payload: 120, type: 'ccm', subtype: 'fir' },
            { payload: 120, type: 'goog-remb' },
            { payload: 96, type: 'nack' },
            { payload: 96, type: 'nack', subtype: 'pli' },
            { payload: 96, type: 'ccm', subtype: 'fir' },
            { payload: 96, type: 'goog-remb' }
        ],
        direction: 'recvonly',
        rtcpMux: 'rtcp-mux',
    },
];
const getCurrentMedia = ({ pwd, ufrag, producers }) => {
    return producers.map((producer, index) => ({
        rtp: [{
                payload: producer.rtpParameters.codecs[0].payloadType,
                codec: producer.rtpParameters.codecs[0].mimeType.split("/")[1],
                rate: producer.rtpParameters.codecs[0].clockRate,
                encoding: producer.rtpParameters.codecs[0].channels
            }],
        fmtp: producer.kind === 'audio' ? [
            { payload: producer.rtpParameters.codecs[0].payloadType, config: 'minptime=10;useinbandfec=1' },
        ] : [],
        type: producer.kind,
        port: 9,
        protocol: 'UDP/TLS/RTP/SAVPF',
        payloads: producer.rtpParameters.codecs[0].payloadType.toString(),
        connection: { version: 4, ip: '0.0.0.0' },
        ext: [],
        icePwd: pwd,
        iceUfrag: ufrag,
        mid: index.toString(),
        setup: 'active',
        rtcpFb: producer.rtpParameters.codecs[0].rtcpFeedback.map(item => ({
            payload: producer.rtpParameters.codecs[0].payloadType,
            type: item.type,
            subtype: item.parameter
        })),
        direction: 'sendonly',
        rtcpMux: 'rtcp-mux',
        ssrcs: [
            {
                id: producer.rtpParameters.encodings[0].ssrc,
                attribute: "cname",
                value: producer.rtpParameters.rtcp.cname
            }
        ]
    }));
};
function getSDP({ transport, mediaCodecs, incoming, producers }) {
    const fingerprint = transport.dtlsParameters.fingerprints.find(item => item.algorithm === 'sha-256');
    const ice = transport.iceParameters;
    const pwd = ice.password;
    const ufrag = ice.usernameFragment;
    const candidates = transport.iceCandidates.map(candidate => {
        const { foundation, protocol, priority, ip, port, type, tcpType } = candidate;
        return {
            candidate: `candidate:${foundation} 1 ${protocol} ${priority} ${ip} ${port}` +
                ` typ ${type} ${tcpType ? ('tcptype' + tcpType) : ''} ufrag ${ufrag}`,
            sdpMid: 0,
            sdpMLineIndex: 0,
            usernameFragment: ufrag
        };
    });
    if (!incoming)
        console.log(`GET ${producers.length} PRODUCERS`);
    const ssrcVideo = crypto.randomBytes(4).readUInt32BE(0);
    const ssrcAudio = crypto.randomBytes(4).readUInt32BE(0);
    const sdp = {
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
        groups: [{ type: 'BUNDLE', mids: incoming ? '0 1' : producers.map((_, index) => index).join(' ') }],
        fingerprint: {
            type: 'sha-256',
            hash: fingerprint.value
        },
        iceOptions: 'trickle',
        msidSemantic: { semantic: 'WMS', token: '*' },
        media: incoming ? getMedia({ ufrag, pwd }) : getCurrentMedia({ ufrag, pwd, producers })
    };
    return {
        id: transport.id,
        candidates,
        answer: {
            sdp: sdpTransform.write(sdp),
            type: "answer"
        }
    };
}
exports.getSDP = getSDP;
//# sourceMappingURL=sdp.js.map