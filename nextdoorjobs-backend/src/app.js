'use strict'

require('dotenv').config()

const fastify = require('fastify')({ logger: true })

fastify.register(require('@fastify/cors'), {
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'https://nextdoorjobs-frontend.onrender.com',
      'https://nextdoorjobs.com',
      'https://www.nextdoorjobs.com'
    ]
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'), false)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
})

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'nextdoorjobs_dev_secret'
})

fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
})

fastify.register(require('./routes/auth'))
fastify.register(require('./routes/listings'))
fastify.register(require('./routes/applications'))
fastify.register(require('./routes/admin'))

fastify.get('/health', async (request, reply) => {
  return {
    status: 'NextdoorJobs backend is running',
    port: process.env.PORT || 4103,
    time: new Date().toISOString()
  }
})

const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 4103,
      host: '0.0.0.0'
    })
    console.log('NextdoorJobs backend running on http://localhost:4103')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
