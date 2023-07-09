// Write your tests here
const db = require('./../data/dbConfig')
const request = require('supertest')
const server = require('./server')
const bcrypt = require('bcryptjs')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

test('sanity', () => {
  expect(true).toBe(true)
})

describe('[POST] /register ', () => {
  const user = { username: 'Harper', password: 'test' }
  const user2 = { username: 'Harper', password: 'abcd' }

  test('Registering generates correct status code and response contains username', async () => {
    const res = await request(server).post('/api/auth/register').send(user)
    console.log(res.body)
    expect(res.status).toBe(201)
    expect(res.body.username).toMatch('Harper')
  })

  test('Attempted signup using existing username generates the correct response', async () => {
    let res = await request(server).post('/api/auth/register').send(user)
    res = await request(server).post('/api/auth/register').send(user2)
    expect(res.body).toMatchObject({message: 'username taken'})
    expect(res.status).toBe(401)
  })
})

describe('[POST] /login ', () => {
  const user = { username: 'harper', password: 'test' }
  const user2 = { username: 'harper' }

  test('Logging in generates 200 response and includes "welcome <username/>" message', async () => {
    const register = await request(server).post('/api/auth/register').send(user)
    const login = await request(server).post('/api/auth/login').send(user)
    expect(login.status).toBe(200)
    expect(login.body.message).toMatch("welcome, harper")
  })
  test('Logging in w/o password generates correct response', async () => {
    const register = await request(server).post('/api/auth/register').send(user)
    const login = await request(server).post('/api/auth/login').send(user2)
    expect(login.status).toBe(401)
    expect(login.body).toMatchObject({message: "username and password required"})
  })
})

describe('[GET] ', () => {
  const user = { username: 'harper', password: 'test' }

  test('get jokes generates correct response', async () => {
    const register = await request(server).post('/api/auth/register').send(user)
    const login = await request(server).post('/api/auth/login').send(user)
    let token = await login.body.token
    const jokes = await request(server).get('/api/jokes').set('Authorization', token)
    expect(jokes.status).toBe(200)
    expect(jokes.body).toHaveLength(3)
  })
  test('Jokes request w/o auth headers triggers restricted response', async () => {
    const register = await request(server).post('/api/auth/register').send(user)
    const login = await request(server).post('/api/auth/login').send(user)
    const jokes = await request(server).get('/api/jokes')
    expect(jokes.status).toBe(401)
    expect(jokes.body.message).toMatch('Token required')
  })
})
