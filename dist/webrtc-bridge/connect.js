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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectIncoming = exports.connectOutcoming = exports.connectProducers = void 0;
const sdpTransform = __importStar(require("sdp-transform"));
function connect(sdp, transport) {
    return __awaiter(this, void 0, void 0, function* () {
        const fingerprint = sdp.fingerprint || sdp.media[0].fingerprint;
        const setup = sdp.media[0].setup;
        const dtlsParameters = {
            role: setup === 'active' ? 'client' : 'server',
            fingerprints: [
                {
                    algorithm: fingerprint.type,
                    value: fingerprint.hash
                }
            ]
        };
        yield transport.connect({ dtlsParameters });
    });
}
function connectProducers(transport, producers) {
    return __awaiter(this, void 0, void 0, function* () {
        const consumers = [];
        for (let producer of producers) {
            const consumer = yield transport.consume({
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
                            kind: "audio",
                            mimeType: "audio/opus",
                            clockRate: 48000,
                            preferredPayloadType: 111,
                            channels: 2
                        },
                        {
                            kind: "video",
                            mimeType: "video/VP8",
                            clockRate: 90000,
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
            });
            consumer.rtpParameters.codecs[0].payloadType = producer.rtpParameters.codecs[0].payloadType;
            consumers.push(consumer);
            yield consumer.enableTraceEvent(["rtp"]);
            consumer.on('trace', trace => console.log(trace));
        }
        for (let consumer of consumers) {
            yield consumer.resume();
        }
        return consumers;
    });
}
exports.connectProducers = connectProducers;
function connectOutcoming(body, { transport }, producers) {
    return __awaiter(this, void 0, void 0, function* () {
        const { offer } = body;
        const sdp = sdpTransform.parse(offer.sdp);
        yield connect(sdp, transport);
        const consumers = yield connectProducers(transport, producers);
        return consumers;
    });
}
exports.connectOutcoming = connectOutcoming;
function connectIncoming(body, { transport }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { offer } = body;
        const sdp = sdpTransform.parse(offer.sdp);
        yield connect(sdp, transport);
        const producers = [];
        for (let media of sdp.media) {
            const producer = yield transport.produce({
                kind: media.type === 'audio' ? 'audio' : 'video',
                rtpParameters: {
                    mid: media.mid.toString(),
                    codecs: [{
                            mimeType: media.type + "/" + media.rtp[0].codec,
                            payloadType: media.rtp[0].payload,
                            clockRate: media.rtp[0].rate,
                            channels: media.rtp[0].encoding,
                            rtcpFeedback: media.rtcpFb ? media.rtcpFb.map(fb => ({ type: fb.type, parameter: fb.subtype })) : undefined
                        }],
                    encodings: [{
                            ssrc: media.ssrcs[0].id,
                        }],
                    rtcp: { cname: media.ssrcs.find(i => i.attribute === 'cname').value, reducedSize: true }
                }
            });
            yield producer.enableTraceEvent(["rtp", "pli"]);
            producer.on('trace', trace => console.log(trace));
            producers.push(producer);
        }
        return producers;
    });
}
exports.connectIncoming = connectIncoming;
//# sourceMappingURL=connect.js.map