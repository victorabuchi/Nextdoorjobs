'use strict'

const db = require('../db/index')

module.exports = async function listingsRoutes(fastify) {

  fastify.post('/api/listings', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    if (request.user.role !== 'client') {
      return reply.status(403).send({ error: 'Only clients can create listings' })
    }

    const { service_type, city, region, country, details } = request.body
    if (!service_type || !city || !region || !country) {
      return reply.status(400).send({ error: 'Service type, city, region, and country are required' })
    }

    const result = await db.query(
      `INSERT INTO listings (client_id, service_type, city, region, country, details)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [request.user.id, service_type, city, region, country, details || null]
    )

    return reply.status(201).send({ listing: result.rows[0] })
  })

  fastify.get('/api/listings/mine', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    if (request.user.role !== 'client') {
      return reply.status(403).send({ error: 'Only clients have listings' })
    }

    const result = await db.query(
      `SELECT l.*, count(a.id)::int AS applicant_count
       FROM listings l
       LEFT JOIN applications a ON a.listing_id = l.id
       WHERE l.client_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [request.user.id]
    )

    return reply.send({ listings: result.rows })
  })

  fastify.get('/api/listings/:id', async (request, reply) => {
    const result = await db.query('SELECT * FROM listings WHERE id = $1', [request.params.id])
    if (!result.rows[0]) {
      return reply.status(404).send({ error: 'Listing not found' })
    }
    return reply.send({ listing: result.rows[0] })
  })

  fastify.patch('/api/listings/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const existing = await db.query('SELECT * FROM listings WHERE id = $1', [request.params.id])
    if (!existing.rows[0]) {
      return reply.status(404).send({ error: 'Listing not found' })
    }
    if (existing.rows[0].client_id !== request.user.id) {
      return reply.status(403).send({ error: 'You do not own this listing' })
    }

    const { status, details } = request.body
    const result = await db.query(
      `UPDATE listings SET
         status = COALESCE($1, status),
         details = COALESCE($2, details)
       WHERE id = $3
       RETURNING *`,
      [status || null, details ?? null, request.params.id]
    )

    return reply.send({ listing: result.rows[0] })
  })

}
