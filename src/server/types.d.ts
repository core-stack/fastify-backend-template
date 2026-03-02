import 'fastify';

import { Session } from './plugins/auth/session.ts';

declare module "fastify" {
  interface FastifyRequest {
    session: Session;
  }
}
