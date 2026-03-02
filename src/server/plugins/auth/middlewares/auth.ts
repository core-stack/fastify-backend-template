import { FastifyReply, FastifyRequest } from 'fastify';

import { Session } from '../session.js';

export const authMiddleware = async (req: FastifyRequest, reply: FastifyReply) => {
  const accessToken = req.cookies['access-token'] || req.headers['authorization']?.split(' ')[1];
  const refreshToken = req.cookies['refresh-token'] || req.headers['refresh-token'] as string | undefined;

  let session: Session | undefined;
  try {
    session = await req.server.auth.getSession(accessToken);
    if (!session && refreshToken) {
      const refreshResult = await req.server.auth.refreshToken(refreshToken);
      session = refreshResult.session;

      reply.setCookie("access-token", refreshResult.token.accessToken, {
        maxAge: refreshResult.token.accessTokenDuration,
        httpOnly: true,
        path: "/",
      });
      reply.setCookie("refresh-token", refreshResult.token.refreshToken, {
        maxAge: refreshResult.token.refreshTokenDuration,
        httpOnly: true,
        path: "/",
      });
    }
  } catch {
    return reply.code(401).send({ error: 'UNAUTHORIZED' });
  }

  if (!session) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  req.session = session;
};