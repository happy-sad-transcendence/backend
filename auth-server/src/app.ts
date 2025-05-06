import Fastify from "fastify";
import dotenv from "dotenv";
import jwtPlugin from "./plugins/jwt.js";
import metricsPlugin from "./plugins/metrics.js";
import routes from "./route/index.js";

export function buildApp() {
    dotenv.config();

    const app = Fastify({
        logger: {
            transport: { target: "pino-pretty" },
        },
    });

    app.register(metricsPlugin);
    app.register(jwtPlugin);

    // 헬스체크 & 루트
    app.get("/", async () => ({ message: "Auth 서버 준비 완료!" }));
    app.get("/health", async () => ({ status: "ok" }));

    app.register(routes);

    return app;
}
