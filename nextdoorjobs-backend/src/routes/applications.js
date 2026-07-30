'use strict'

const db = require('../db/index')

module.exports = async function applicationsRoutes(fastify) {

  fastify.post('/api/applications', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    if (request.user.role !== 'worker') {
      return reply.status(403).send({ error: 'Only workers can apply to listings' })
    }

    const { listing_id } = request.body
    if (!listing_id) {
      return reply.status(400).send({ error: 'listing_id is required' })
    }

    const listing = await db.query('SELECT id, status FROM listings WHERE id = $1', [listing_id])
    if (!listing.rows[0]) {
      return reply.status(404).send({ error: 'Listing not found' })
    }
    if (listing.rows[0].status !== 'open') {
      return reply.status(409).send({ error: 'This listing is closed' })
    }

    const existing = await db.query(
      'SELECT id FROM applications WHERE listing_id = $1 AND worker_id = $2',
      [listing_id, request.user.id]
    )
    if (existing.rows[0]) {
      return reply.status(409).send({ error: 'You already applied to this listing' })
    }

    const result = await db.query(
      `INSERT INTO applications (listing_id, worker_id)
       VALUES ($1, $2)
       RETURNING *`,
      [listing_id, request.user.id]
    )

    return reply.status(201).send({ application: result.rows[0] })
  })

  fastify.get('/api/applications/mine', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    if (request.user.role !== 'worker') {
      return reply.status(403).send({ error: 'Only workers have applications' })
    }

    const result = await db.query(
      `SELECT a.*, l.service_type, l.city, l.region, l.country, l.status AS listing_status
       FROM applications a
       JOIN listings l ON l.id = a.listing_id
       WHERE a.worker_id = $1
       ORDER BY a.created_at DESC`,
      [request.user.id]
    )

    return reply.send({ applications: result.rows })
  })

  fastify.get('/api/applications/listing/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const listing = await db.query('SELECT client_id FROM listings WHERE id = $1', [request.params.id])
    if (!listing.rows[0]) {
      return reply.status(404).send({ error: 'Listing not found' })
    }
    if (listing.rows[0].client_id !== request.user.id && request.user.role !== 'admin') {
      return reply.status(403).send({ error: 'You do not own this listing' })
    }

    const result = await db.query(
      `SELECT a.*, u.full_name, u.email, u.phone, u.work_type
       FROM applications a
       JOIN users u ON u.id = a.worker_id
       WHERE a.listing_id = $1
       ORDER BY a.created_at ASC`,
      [request.params.id]
    )

    return reply.send({ applications: result.rows })
  })

}
