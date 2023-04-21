import { beforeAll, beforeEach, afterAll, describe, expect, test } from 'vitest'
import supertest from 'supertest'

import { execSync } from 'node:child_process'
import { app } from '../src/app'

describe('users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  const userData = {
    name: 'John Doe',
    email: 'johndoe@gmail.com',
  }

  describe('POST /users', () => {
    test('should create a new user', async () => {
      const response = await supertest(app.server).post('/users').send(userData)

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
