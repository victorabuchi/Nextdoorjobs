'use strict'

const db = require('../db/index')

function requireAdmin(request, reply, done) {
  if (request.user.role !== 'admin') {
    reply.status(403).send({ error: 'Admin only' })
    return
  }
  done()
}

module.exports = async function adminRoutes(fastify) {

  fastify.get('/api/admin/listings', {
    onRequest: [fastify.authenticate, requireAdmin]
  }, async (request, reply) => {
    const result = await db.query(
      `SELECT l.*, u.full_name AS client_name, u.email AS client_email,
              count(a.id)::int AS applicant_count
       FROM listings l
       JOIN users u ON u.id = l.client_id
       LEFT JOIN applications a ON a.listing_id = l.id
       GROUP BY l.id, u.full_name, u.email
       ORDER BY l.created_at DESC`
    )
    return reply.send({ listings: result.rows })
  })

  fastify.get('/api/admin/applications', {
    onRequest: [fastify.authenticate, requireAdmin]
  }, async (request, reply) => {
    const result = await db.query(
      `SELECT a.*, w.full_name AS worker_name, w.email AS worker_email,
              l.service_type, l.city, l.region, l.country
       FROM applications a
       JOIN users w ON w.id = a.worker_id
       JOIN listings l ON l.id = a.listing_id
       ORDER BY a.created_at DESC`
    )
    return reply.send({ applications: result.rows })
  })

  fastify.patch('/api/admin/applications/:id', {
    onRequest: [fastify.authenticate, requireAdmin]
  }, async (request, reply) => {
    const { status } = request.body
    const valid = ['submitted', 'reviewing', 'matched', 'rejected']
    if (!valid.includes(status)) {
      return reply.status(400).send({ error: 'status must be one of ' + valid.join(', ') })
    }

    const result = await db.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, request.params.id]
    )
    if (!result.rows[0]) {
      return reply.status(404).send({ error: 'Application not found' })
    }

    return reply.send({ application: result.rows[0] })
  })

}
