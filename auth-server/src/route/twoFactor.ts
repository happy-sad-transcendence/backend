// src/routes/twoFactor.ts
import { FastifyInstance } from "fastify";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

const secretMap = new Map<string, string>(); // 간단한 메모리 저장소 (실제 앱에서는 DB 사용)

export async function twoFactorRoutes(app: FastifyInstance) {
    // OTP 시크릿 생성 및 QR 코드 발급
    app.get("/setup", async (req, reply) => {
        const email = (req.query as any).email;
        if (!email) return reply.status(400).send({ error: "Missing email" });

        const secret = speakeasy.generateSecret({
            name: `ft_transcendence (${email})`,
        });

        secretMap.set(email, secret.base32);

        const qr = await qrcode.toDataURL(secret.otpauth_url!);
        return reply.send({ qr, secret: secret.base32 });
    });

    // OTP 코드 검증
    app.post("/verify", async (req, reply) => {
        const { email, token } = req.body as { email: string; token: string };

        const secret = secretMap.get(email);
        if (!secret)
            return reply.status(400).send({ error: "No 2FA registered" });

        const verified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token,
            window: 1,
        });

        if (!verified) {
            return reply
                .status(401)
                .send({ success: false, error: "Invalid token" });
        }

        return reply.send({ success: true });
    });
}
