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
const room_1 = __importDefault(require("../room"));
const sdp_1 = require("../libs/sdp");
function app(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        const worker = yield mediasoup_1.createWorker({ logLevel: "debug" });
        fastify.decorate("worker", worker);
        fastify.decorate("rooms", new Map());
        fastify.post("/rooms", () => __awaiter(this, void 0, void 0, function* () {
            const room = new room_1.default();
            yield room.init(fastify.worker);
            fastify.rooms.set(room.id, room);
            return { room_id: room.id };
        }));
        fastify.post("/rooms/:room_id/users/:user_id", (request) => __awaiter(this, void 0, void 0, function* () {
            const { room_id, user_id } = request.params;
            const room = fastify.rooms.get(room_id);
            const user = yield room.addUser(user_id);
            const offer = sdp_1.generateOffer(user.consumeTransport, []);
        }));
        // fastify.post("/rooms/:room_id/ts", async (request) => {
        // 	const { room_id } = request.params as any
        // 	const { incoming } = request.body as any
        // 	const room = fastify.rooms.get(room_id)
        // 	return await room.createTransport(incoming)
        // })
        // fastify.post("/rooms/:room_id/ts/:transport_id", async (request) => {
        // 	const { room_id, transport_id } = request.params as any
        // 	const { dtlsParameters } = request.body as any 
        // 	const room = fastify.rooms.get(room_id)
        // 	await room.confirmTransport(transport_id, dtlsParameters)
        // 	return { success: "success" }
        // })
        // fastify.post("/rooms/:room_id/ts/:transport_id/produce", async (request) => {
        // 	const { room_id, transport_id } = request.params as any
        // 	const { kind, rtpParameters } = request.body as any
        // 	const room = fastify.rooms.get(room_id)
        // 	return await room.createProducer(transport_id, { kind, rtpParameters })
        // })
        // fastify.post("/rooms/:room_id/ts/:transport_id/consume", async (request) => {
        // 	const { room_id, transport_id } = request.params as any
        // 	const room = fastify.rooms.get(room_id)
        // 	return await room.createConsumers(transport_id)
        // })
        // fastify.post("/rooms/:room_id/ts/:transport_id/resume", async (request) => {
        // 	const { room_id, transport_id } = request.params as any
        // 	const room = fastify.rooms.get(room_id)
        // 	await room.resumeConsume(transport_id)
        // 	return { success: "success"}
        // })
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map