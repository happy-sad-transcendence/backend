// src/routes/oauth.ts
import { FastifyInstance } from "fastify";
import axios from "axios";

export async function oauthRoutes(app: FastifyInstance) {
    // Step 1. Google 로그인 리디렉션
    app.get("/oauth/google", async (req, reply) => {
        const redirectUrl =
            `https://accounts.google.com/o/oauth2/v2/auth` +
            `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
            `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
            `&response_type=code` +
            `&scope=openid%20email%20profile`;
        return reply.redirect(redirectUrl);
    });

    // Step 2. Google Callback 처리
    app.get("/oauth/google/callback", async (req, reply) => {
        const code = (req.query as any).code;
        if (!code) {
            return reply.status(400).send({ error: "Missing code" });
        }

        try {
            // 액세스 토큰 요청
            const tokenRes = await axios.post(
                "https://oauth2.googleapis.com/token",
                null,
                {
                    params: {
                        code,
                        client_id: process.env.GOOGLE_CLIENT_ID,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET,
                        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                        grant_type: "authorization_code",
                    },
                },
            );

            const { access_token } = tokenRes.data;

            // 사용자 정보 요청
            const userRes = await axios.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                    headers: { Authorization: `Bearer ${access_token}` },
                },
            );

            const { email, id, name } = userRes.data;

            // JWT 발급
            const token = app.jwt.sign({ email, googleId: id, name });
            return reply.send({ token });
        } catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: "OAuth failed" });
        }
    });
}
