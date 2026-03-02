import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export const errorHandler = (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
  if (error.validation) {
    const errors = error.validation.map((err: any) => {
      const path = err.instancePath?.replace('/', '') || err.dataPath?.replace('/', '') || err.params?.missingProperty || '';
      const message = req.t?.(err.message);
      return { path, message };
    });
  
    reply.status(400).send({
      status: 400,
      message: req.t?.('Validation error', 'Validation error'),
      errors,
    });
    return;
  }

  reply.status(500).send({ status: 500, message: 'Internal Server Error' })
}