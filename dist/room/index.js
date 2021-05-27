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
const codecs_1 = __importDefault(require("./codecs"));
const user_1 = __importDefault(require("./user"));
class Room {
    init(worker) {
        return __awaiter(this, void 0, void 0, function* () {
            const router = yield worker.createRouter({ mediaCodecs: codecs_1.default });
            this.router = router;
            this.id = router.id;
            this.users = new Map();
        });
    }
    addUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new user_1.default(user_id);
            this.users.set(user_id, user);
            yield user.init(this.router);
            return user;
        });
    }
}
exports.default = Room;
//# sourceMappingURL=index.js.map