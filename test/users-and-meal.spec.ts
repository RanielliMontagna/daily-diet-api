import { beforeAll, beforeEach, afterAll, describe, expect, test } from 'vitest'
import supertest from 'supertest'

import { execSync } from 'node:child_process'
import { app } from '../src/app'

describe('all routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  const userData = {
    name: 'John Doe',
    email: 'johndoe@gmail.com',
  }

  async function createUser() {
    const createUserResponse = await supertest(app.server)
      .post('/users')
      .send(userData)

    const cookies = createUserResponse.get('Set-Cookie')

    return cookies
  }

  describe('users routes', () => {
    describe('POST /users', () => {
      test('should create a new user', async () => {
        const response = await supertest(app.server)
          .post('/users')
          .send(userData)

        expect(response.status).toBe(201)
      })
    })

    describe('GET /users/me', () => {
      test('should return a user', async () => {
        const createUserResponse = await supertest(app.server)
          .post('/users')
          .send(userData)

        const cookies = createUserResponse.get('Set-Cookie')

        const getUserResponse = await supertest(app.server)
          .get('/users/me')
          .set('Cookie', cookies)

        expect(getUserResponse.status).toBe(200)
        expect(getUserResponse.body).toEqual(userData)
      })
    })
  })

  describe('meals routes', () => {
    describe('POST /meals', () => {
      const mealData = {
        name: 'Pizza',
        description: 'Pizza with cheese and tomato',
        isOnTheDiet: false,
      }

      test('should create a new meal', async () => {
        const cookies = await createUser()

        const response = await supertest(app.server)
          .post('/meals')
          .set('Cookie', cookies)
          .send(mealData)

        expect(response.status).toBe(201)
      })
    })

    describe('GET /meals', () => {
      test('should return a meal', async () => {
        const cookies = await createUser()

        const mealData = {
          name: 'Pizza',
          description: 'Pizza with cheese and tomato',
          isOnTheDiet: false,
        }

        await supertest(app.server)
          .post('/meals')
          .set('Cookie', cookies)
          .send(mealData)

        const getMealResponse = await supertest(app.server)
          .get('/meals')
          .set('Cookie', cookies)

        expect(getMealResponse.status).toBe(200)
        expect(getMealResponse.body.meals).toEqual([
          expect.objectContaining({
            name: mealData.name,
            description: mealData.description,
          }),
        ])
      })
    })

    describe('GET /meals/:id', () => {
      test('should return a meal', async () => {
        const cookies = await createUser()

        const mealData = {
          name: 'Pizza',
          description: 'Pizza with cheese and tomato',
          isOnTheDiet: false,
        }

        await supertest(app.server)
          .post('/meals')
          .set('Cookie', cookies)
          .send(mealData)

        const listMealsResponse = await supertest(app.server)
          .get('/meals')
          .set('Cookie', cookies)

        const mealId = listMealsResponse.body.meals[0].id

        const getMealResponse = await supertest(app.server)
          .get(`/meals/${mealId}`)
          .set('Cookie', cookies)

        expect(getMealResponse.status).toBe(200)
      })
    })

    describe('PUT /meals/:id', () => {
      test('should update a meal', async () => {
        const cookies = await createUser()

        const mealData = {
          name: 'Pizza',
          description: 'Pizza with cheese and tomato',
          isOnTheDiet: false,
        }

        await supertest(app.server)
          .post('/meals')
          .set('Cookie', cookies)
          .send(mealData)

        const listMealsResponse = await supertest(app.server)
          .get('/meals')
          .set('Cookie', cookies)

        const mealId = listMealsResponse.body.meals[0].id

        const updateMealResponse = await supertest(app.server)
          .put(`/meals/${mealId}`)
          .set('Cookie', cookies)
          .send({
            name: 'Pizza',
            description: 'Pizza with cheese and tomato',
            isOnTheDiet: true,
          })

        expect(updateMealResponse.status).toBe(202)
      })
    })

    describe('DELETE /meals/:id', () => {
      test('should delete a meal', async () => {
        const cookies = await createUser()

        const mealData = {
          name: 'Pizza',
          description: 'Pizza with cheese and tomato',
          isOnTheDiet: false,
        }

        await supertest(app.server)
          .post('/meals')
          .set('Cookie', cookies)
          .send(mealData)

        const listMealsResponse = await supertest(app.server)
          .get('/meals')
          .set('Cookie', cookies)

        const mealId = listMealsResponse.body.meals[0].id

        const deleteMealResponse = await supertest(app.server)
          .delete(`/meals/${mealId}`)
          .set('Cookie', cookies)

        expect(deleteMealResponse.status).toBe(202)
        expect(deleteMealResponse.body.message).toBe(
          'Refeição deletada com sucesso',
        )
      })
    })
  })
})
