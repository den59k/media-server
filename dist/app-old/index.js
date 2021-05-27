"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mediasoup_1 = require("mediasoup");
const codecs_1 = __importDefault(require("./codecs"));
const sdp_1 = require("../webrtc-bridge/sdp");
const connect_1 = require("../webrtc-bridge/connect");
function app(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        const worker = yield mediasoup_1.createWorker({ logLevel: "debug" });
        fastify.decorate("worker", worker);
        fastify.decorate("routers", new Map());
        fastify.decorate("transports", new Map());
        fastify.post("/create-room", (request) => __awaiter(this, void 0, void 0, function* () {
            const router = yield worker.createRouter({ mediaCodecs: codecs_1.default });
            fastify.routers.set(router.id, { router, transports: new Map(), producers: new Map(), consumers: new Map() });
            return { id: router.id };
        }));
        fastify.post("/create-transport/:room_id", (request) => __awaiter(this, void 0, void 0, function* () {
            const { room_id } = request.params;
            const { incoming } = request.body;
            const routerObj = fastify.routers.get(room_id);
            const transport = yield routerObj.router.createWebRtcTransport({
                listenIps: [{ ip: "0.0.0.0", announcedIp: "192.168.0.100" }],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true
            });
            transport.on("icestatechange", state => console.log((incoming ? "receiver" : "sender") + " ICE state changed to " + state));
            transport.on("dtlsstatechange", state => console.log((incoming ? "receiver" : "sender") + " DTLS state changed to " + state));
            routerObj.transports.set(transport.id, transport);
            return sdp_1.getSDP({ transport, mediaCodecs: codecs_1.default, incoming, producers: Array.from(routerObj.producers.values()) });
        }));
        fastify.post("/confirm/:room_id", (request) => __awaiter(this, void 0, void 0, function* () {
            const { room_id } = request.params;
            const { transport_id, candidates, offer, incoming } = request.body;
            const routerObj = fastify.routers.get(room_id);
            if (incoming) {
                const transport = routerObj.transports.get(transport_id);
                const producers = yield connect_1.connectIncoming({ candidates, offer }, { transport, mediaCodecs: codecs_1.default });
                for (let producer of producers) {
                    const id = producer.id;
                    routerObj.producers.set(id, producer);
                    producer.on('transportclose', () => routerObj.producers.delete(id));
                }
                return { status: "connected" };
            }
            else {
                const transport = routerObj.transports.get(transport_id);
                yield connect_1.connectOutcoming({ candidates, offer }, { transport, mediaCodecs: codecs_1.default }, Array.from(routerObj.producers.values()));
                return { status: "connected" };
            }
        }));
        fastify.post("/crt/:room_id", (request) => __awaiter(this, void 0, void 0, function* () {
            const { room_id } = request.params;
            const routerObj = fastify.routers.get(room_id);
            const transport = yield routerObj.router.createWebRtcTransport({
                listenIps: [{ ip: "0.0.0.0", announcedIp: "192.168.0.100" }],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true
            });
            const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } = transport;
            routerObj.transports.set(transport.id, transport);
            transport.on("icestatechange", state => "$$$ ICE state changed to " + state);
            transport.on("dtlsstatechange", state => "$$$ DTLS state changed to " + state);
            const consumers = yield connect_1.connectProducers(transport, Array.from(routerObj.producers.values()));
            return {
                transport: { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters },
                routerRtpCapabilities: mediasoup_1.getSupportedRtpCapabilities(),
                consumers: consumers.map(consumer => ({
                    id: consumer.id,
                    producerId: consumer.producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters
                }))
            };
        }));
        fastify.post("/cfm/:room_id", (request) => __awaiter(this, void 0, void 0, function* () {
            const { room_id } = request.params;
            const { transportId, dtlsParameters } = request.body;
            const routerObj = fastify.routers.get(room_id);
            const transport = routerObj.transports.get(transportId);
            yield transport.connect({ dtlsParameters });
            return { success: "success" };
        }));
        fastify.setErrorHandler(function (error, _request, reply) {
            console.log(error);
            reply.status(500).send({ error: 'Ошибка сервера' });
        });
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map