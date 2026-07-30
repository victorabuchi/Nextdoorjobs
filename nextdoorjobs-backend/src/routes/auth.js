'use strict'

const bcrypt = require('bcrypt')
const db = require('../db/index')

const VALID_ROLES = ['worker', 'client']

module.exports = async function authRoutes(fastify) {

  fastify.post('/api/auth/register', async (request, reply) => {
    const { full_name, email, password, role, phone, city, region, country, work_type } = request.body

    if (!full_name || !email || !password || !role) {
      return reply.status(400).send({ error: 'Full name, email, password, and role are required' })
    }
    if (!VALID_ROLES.includes(role)) {
      return reply.status(400).send({ error: 'Role must be worker or client' })
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows[0]) {
      return reply.status(409).send({ error: 'This email is already registered' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const result = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, city, region, country, work_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, full_name, email, role, phone, city, region, country, work_type`,
      [full_name, email, password_hash, role, phone || null, city || null, region || null, country || null, work_type || null]
    )

    const user = result.rows[0]

    const token = fastify.jwt.sign(
      { id: user.id, role: user.role, full_name: user.full_name },
      { expiresIn: '30d' }
    )

    return reply.status(201).send({ token, user })
  })

  fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' })
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (!result.rows[0]) {
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    const token = fastify.jwt.sign(
      { id: user.id, role: user.role, full_name: user.full_name },
      { expiresIn: '30d' }
    )

    return reply.send({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        region: user.region,
        country: user.country,
        work_type: user.work_type
      }
    })
  })

  fastify.get('/api/auth/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const result = await db.query(
      'SELECT id, full_name, email, role, phone, city, region, country, work_type, created_at FROM users WHERE id = $1',
      [request.user.id]
    )
    if (!result.rows[0]) {
      return reply.status(404).send({ error: 'User not found' })
    }
    return reply.send({ user: result.rows[0] })
  })

  fastify.patch('/api/auth/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { full_name, phone, city, region, country, work_type } = request.body

    const result = await db.query(
      `UPDATE users SET
         full_name = COALESCE($1, full_name),
         phone = COALESCE($2, phone),
         city = COALESCE($3, city),
         region = COALESCE($4, region),
         country = COALESCE($5, country),
         work_type = COALESCE($6, work_type)
       WHERE id = $7
       RETURNING id, full_name, email, role, phone, city, region, country, work_type, created_at`,
      [full_name || null, phone || null, city || null, region || null, country || null, work_type || null, request.user.id]
    )

    return reply.send({ user: result.rows[0] })
  })

  fastify.post('/api/auth/change-password', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { current_password, new_password } = request.body
    if (!current_password || !new_password) {
      return reply.status(400).send({ error: 'Current and new password are required' })
    }
    if (new_password.length < 8) {
      return reply.status(400).send({ error: 'New password must be at least 8 characters' })
    }

    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [request.user.id])
    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash)
    if (!valid) {
      return reply.status(401).send({ error: 'Current password is incorrect' })
    }

    const password_hash = await bcrypt.hash(new_password, 12)
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, request.user.id])

    return reply.send({ message: 'Password updated' })
  })

}
