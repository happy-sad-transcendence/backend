import { FastifyPluginAsync } from "fastify";
import { authRoutes } from "./auth.js";
import { oauthRoutes } from "./oauth.js";
import { twoFactorRoutes } from "./twoFactor.js";

const routes: FastifyPluginAsync = async (app) => {
    app.register(authRoutes, { prefix: "/auth" });
    app.register(oauthRoutes, { prefix: "/oauth" });
    app.register(twoFactorRoutes, { prefix: "/2fa" });
};

export default routes;
