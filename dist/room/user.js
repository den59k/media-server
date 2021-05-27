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
Object.defineProperty(exports, "__esModule", { value: true });
const transportOptions = {
    listenIps: [{ ip: "0.0.0.0", announcedIp: "192.168.0.100" }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true
};
class User {
    constructor(id) {
        this.id = id;
    }
    init(router) {
        return __awaiter(this, void 0, void 0, function* () {
            this.consumeTransport = yield router.createWebRtcTransport(transportOptions);
            this.consumeTransport.on("icestatechange", state => console.log("receiver ICE state changed to " + state));
            const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } = this.consumeTransport;
            return {
                consumeTransport: { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters }
            };
        });
    }
    confirmConsumeTransport({ dtlsParameters }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.consumeTransport.connect({ dtlsParameters });
        });
    }
    confirmProduceTransport({ dtlsParameters }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.produceTransport.connect({ dtlsParameters });
        });
    }
    createProduceTransport(router) {
        return __awaiter(this, void 0, void 0, function* () {
            this.produceTransport = yield router.createWebRtcTransport(transportOptions);
            this.consumeTransport.on("icestatechange", state => console.log("sender ICE state changed to " + state));
            const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } = this.consumeTransport;
            return {
                produceTransport: { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters }
            };
        });
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map