// src/routes/auth.ts
import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  // JWT 발급: POST /login
  app.post('/login', async (req, reply) => {
    const body = req.body as { email?: string };
    if (!body.email) {
      return reply.status(400).send({ error: 'Missing email' });
    }

    const token = app.jwt.sign({ email: body.email });
    return reply.send({ token });
  });

  // JWT 검증: GET /verify
  app.get('/verify', async (req, reply) => {
    try {
      const auth = req.headers.authorization;
      if (!auth?.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Missing token' });
      }

      const decoded = await app.jwt.verify(auth.split(' ')[1]);
      return reply.send({ valid: true, decoded });
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid token' });
    }
  });
}
