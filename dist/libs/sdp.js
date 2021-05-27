"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOffer = void 0;
const sdp_transform_1 = __importDefault(require("sdp-transform"));
function producerToMedia(transport, producer) {
    return ({
        rtp: producer.rtpParameters.codecs.map(codec => ({
            payload: codec.payloadType,
            codec: codec.mimeType.split("/")[1],
            rate: codec.clockRate,
            encoding: codec.channels
        })),
        fmtp: producer.rtpParameters.codecs.map(codec => ({
            payload: codec.payloadType,
            config: codec.parameters.length > 0 ? codec.parameters.map(param => param.type + "=" + param.parameter).join(";") : ''
        })).filter(item => item.config !== ''),
        type: producer.kind,
        port: 9,
        protocol: 'UDP/TLS/RTP/SAVPF',
        payloads: producer.rtpParameters.codecs.map(codec => codec.payloadType).join(" "),
        connection: { version: 4, ip: '0.0.0.0' },
        ext: [],
        iceUfrag: transport.iceParameters.usernameFragment,
        icePwd: transport.iceParameters.password,
        mid: producer.rtpParameters.mid,
        setup: transport.dtlsParameters.role === 'client' ? 'active' : 'actpass',
        direction: 'recvonly',
        rtcpMux: 'rtcp-mux',
        rtcpFb: producer.rtpParameters.codecs.map(item => item.rtcpFeedback.map(rtcp => ({
            id: 'kek'
        })).flat())
    });
}
function generateOffer(transport, producers) {
    return sdp_transform_1.default.write({
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
        groups: [{ type: 'BUNDLE', mids: producers.map((_, index) => index).join(' ') }],
        fingerprint: {
            type: transport.dtlsParameters.fingerprints[0].algorithm,
            hash: transport.dtlsParameters.fingerprints[0].value
        },
        iceOptions: 'ice-lite',
        msidSemantic: { semantic: 'WMS', token: '*' },
        direction: "recvonly",
        media: producers.map(producer => producerToMedia(transport, producer)),
    });
}
exports.generateOffer = generateOffer;
//# sourceMappingURL=sdp.js.map