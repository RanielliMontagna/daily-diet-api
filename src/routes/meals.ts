import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'

import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  // Rota para criar uma refeição
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnTheDiet: z.boolean(),
      })

      const { name, description, isOnTheDiet } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        name,
        description,
        isOnTheDiet,
      })

      return response.status(201).send()
    },
  )

  // Rota para listar todas as refeições do usuário
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const [user] = await knex('users')
      .where('session_id', sessionId)
      .select('id')

    const userId = user.id

    const meals = await knex('meals').where('user_id', userId).select()

    return { meals }
  })

  // Rota para pegar informações de uma refeição específica
  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const getMealParamsSchema = z.object({ id: z.string().uuid() })

      const params = getMealParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const meal = await knex('meals')
        .where('id', params.id)
        .andWhere('user_id', userId)
        .first()

      if (!meal) {
        return response.status(404).send({
          error: 'Refeição não encontrada',
        })
      }

      return { meal }
    },
  )

  // Rota para atualizar uma refeição
  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const params = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const meal = await knex('meals')
        .where('id', params.id)
        .andWhere('user_id', userId)
        .first()
        .delete()

      if (!meal) {
        return response.status(401).send({
          error: 'Unauthorized',
        })
      }

      return response.status(202).send({
        message: 'Refeição deletada com sucesso',
      })
    },
  )

  // Rota para atualizar uma refeição
  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const getMealParamsSchema = z.object({ id: z.string().uuid() })

      const params = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const editMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnTheDiet: z.boolean(),
      })

      const { name, description, isOnTheDiet } = editMealBodySchema.parse(
        request.body,
      )

      const meal = await knex('meals')
        .where('id', params.id)
        .andWhere('user_id', userId)
        .first()
        .update({
          name,
          description,
          isOnTheDiet,
        })

      if (!meal) {
        return response.status(401).send({
          error: 'Refeição não encontrada',
        })
      }

      return response.status(202).send()
    },
  )

  // Resumo das refeições
  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const [count] = await knex('meals')
        .count('id', { as: 'Total de refeições registradas' })
        .where('user_id', userId)

      const refDieta = await knex('meals')
        .count('id', { as: 'Total de refeições dentro da dieta' })
        .where('isOnTheDiet', true)
        .andWhere('user_id', userId)

      const refForaDieta = await knex('meals')
        .count('id', { as: 'Total de refeições fora da dieta' })
        .where('isOnTheDiet', false)
        .andWhere('user_id', userId)

      const summary = {
        'Total de refeições registradas': parseInt(
          JSON.parse(JSON.stringify(count))['Total de refeições registradas'],
        ),

        'Total de refeições dentro da dieta': parseInt(
          JSON.parse(JSON.stringify(refDieta))[0][
            'Total de refeições dentro da dieta'
          ],
        ),

        'Total de refeições fora da dieta': parseInt(
          JSON.parse(JSON.stringify(refForaDieta))[0][
            'Total de refeições fora da dieta'
          ],
        ),
      }

      return { summary }
    },
  )
}
