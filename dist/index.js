"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const app_1 = __importDefault(require("./app"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const server = fastify_1.default();
//Добавляем всё наше приложение к fastify
server.register(app_1.default);
server.register(fastify_cors_1.default, {
    origin: '*',
    methods: "*",
    allowedHeaders: "*"
});
server.setErrorHandler(function (error, _request, reply) {
    console.log(error);
    reply.status(500).send({ error: 'Ошибка сервера' });
});
const port = 5000;
server.listen(port, function (err, address) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(`server listening on ${address}`);
});
//# sourceMappingURL=index.js.map