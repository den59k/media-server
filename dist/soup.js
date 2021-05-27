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
exports.soupConnect = exports.getTransportParameters = void 0;
function getTransportParameters(transport) {
    return {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters
    };
}
exports.getTransportParameters = getTransportParameters;
function soupConnect(transport, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const { dtlsParameters, kind, rtpParameters } = body;
        if (dtlsParameters) {
            console.log(dtlsParameters);
            yield transport.connect({ dtlsParameters });
            return { status: "not yet" };
        }
        else {
            const producer = yield transport.produce({
                kind,
                rtpParameters
            });
            yield producer.enableTraceEvent(["rtp", "pli"]);
            producer.on('trace', trace => console.log(trace));
            return { id: producer.id };
        }
    });
}
exports.soupConnect = soupConnect;
//# sourceMappingURL=soup.js.map