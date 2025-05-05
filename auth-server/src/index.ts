import Fastify from "fastify";
import dotenv from "dotenv";
import jwt from "@fastify/jwt";
import metricsPlugin from "fastify-metrics";
import { loadJwtSecret } from "./service/vault.js";
import { authRoutes } from "./route/auth.js";
import { oauthRoutes } from "./route/oauth.js";
import { twoFactorRoutes } from "./route/2fa.js";

dotenv.config();

async function main() {
    const app = Fastify({
        logger: {
            transport: {
                target: "pino-pretty",
            },
        },
    });

    app.register(metricsPlugin, {
        endpoint: "/metrics",
    });

    const jwtSecret = await loadJwtSecret();
    app.register(jwt, { secret: jwtSecret });

    app.get("/", async (): Promise<{ message: string }> => {
        return { message: "Auth server ready!" };
    });

    app.register(authRoutes);
    app.register(oauthRoutes);
    app.register(twoFactorRoutes);

    const PORT = Number(process.env.PORT || 4000);
    app.listen(
        { port: PORT, host: "0.0.0.0" },
        (err: Error, address: string) => {
            if (err) {
                app.log.error(err);
                process.exit(1);
            }
            app.log.info(`Auth server running at ${address}`);
        },
    );
}

main().catch((err) => {
    console.error("Startup error:", err);
});
