import { FastifyInstance } from 'fastify'
import crypto, { randomUUID } from 'node:crypto'

import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  // Rota para criar um usuário
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    const checkUserExist = await knex
      .select('*')
      .from('users')
      .where('email', email)
      .first()

    if (checkUserExist) {
      return reply.status(400).send({ error: 'User already exists' })
    }

    // Verificando se já existe uma sessionID
    let sessionId = request.cookies.sessionId

    // Caso não exista, criar um
    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/meals',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  // Rota para pegar informações do usuário
  app.get('/me', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const user = await knex
      .select('name', 'email')
      .from('users')
      .where('session_id', sessionId)
      .first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    return reply.status(200).send(user)
  })
}
