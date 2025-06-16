import { UserService } from '../../service/user.service.js';
import {
  UserSettingUpdateRequestSchema,
  UserSettingResponseSchema,
  UserSettingUpdateRequestDTO,
  ErrorResponseSchema,
  UserSecretKeyResponseSchema,
} from '@hst/dto';
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';

const plugin: FastifyPluginAsyncTypebox = async (app) => {
  const userService = new UserService(app);

  app.get(
    '/user/setting',
    {
      schema: {
        response: {
          200: UserSettingResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['user'],
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.user;
        const user2FA = await userService.getUser2fa(email);
        return reply.send(user2FA);
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to get users' });
      }
    },
  );

  app.post(
    '/user/setting',
    {
      schema: {
        querystring: Type.Object({
          email: Type.String(),
        }),
        response: {
          200: UserSettingResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['user'],
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.query;

        const user2FA = await userService.createUser(email);
        return reply.send(user2FA);
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to get users' });
      }
    },
  );

  app.patch<{ Body: UserSettingUpdateRequestDTO }>(
    '/user/setting',
    {
      schema: {
        body: UserSettingUpdateRequestSchema,
        response: {
          204: {},
          500: ErrorResponseSchema,
        },
        tags: ['user'],
      },
    },
    async (request, reply) => {
      const clientToken = request.cookies.access_token;
      const { email } = request.user;
      try {
        await userService.updateUser2fa(email, clientToken, request.body);
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({
          error: 'Failed to update user',
        });
      }
    },
  );

  app.get(
    '/user/twofa',
    {
      schema: {
        querystring: Type.Object({
          email: Type.String(),
        }),
        response: {
          200: UserSecretKeyResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['user'],
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.query;
        const userSecretKey = await userService.getUserSecretKey(email);
        return reply.status(200).send(userSecretKey);
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to get user secret key' });
      }
    },
  );
};

export default plugin;
