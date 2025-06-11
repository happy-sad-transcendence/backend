import { FastifyInstance } from 'fastify';
import { UserService } from '../../service/user.service.js';
import { UserSettingUpdateRequestSchema, UserSettingResponseSchema } from '@hst/dto';

export async function userController(app: FastifyInstance) {
  // TODO: DI Container로 나중에 교체
  const userService = new UserService();

  app.get(
    '/user/setting',
    {
      schema: {
        response: {
          200: UserSettingResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await userService.createUser(email);
        return reply.send({ user });
      } catch (error) {
        app.log.error('Error getting users:', error);
        return reply.status(500).send({ error: 'Failed to get users' });
      }
    },
  );

  app.patch(
    '/user/setting',
    {
      schema: {
        body: UserSettingUpdateRequestSchema,
        response: {
          204: 'NULL',
        },
      },
    },
    async (request, reply) => {
      try {
        await userService.updateUser(email, request.body);
        return reply.status(204).send();
      } catch (error) {
        app.log.error('Error creating user:', error);
        return reply.status(500).send({
          error: 'Failed to create user',
        });
      }
    },
  );
}
