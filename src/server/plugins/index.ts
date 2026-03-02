import { env } from "@/env.js";
import fastifyCookiePlugin from '@fastify/cookie';
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import auth from "./auth/index.js";
import i18n from "./i18n.js";

export const registerPlugins = async (app: FastifyInstance, prisma: PrismaClient) => {

  await app.register(fastifyCookiePlugin, { secret: env.COOKIE_SECRET });

  await app.register(auth, {
    jwt: {
      secret: env.JWT_SECRET,
      accessTokenDuration: env.JWT_ACCESS_TOKEN_DURATION,
      refreshTokenDuration: env.JWT_REFRESH_TOKEN_DURATION,
    },
    store: { type: "redis", options: { url: env.REDIS_URL || "" } },
    providers: {},
    prisma,
  });
  await app.register(i18n);

  await app.register(cors, { origin: true });

  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Snipet Core API",
        description: "API documentation for Snipet Core",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: "/swagger",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
};