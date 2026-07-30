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

  fastify.get('/api/admin/users', {
    onRequest: [fastify.authenticate, requireAdmin]
  }, async (request, reply) => {
    const result = await db.query(
      'SELECT id, full_name, email, role, city, region, country, created_at FROM users ORDER BY created_at DESC'
    )
    return reply.send({ users: result.rows })
  })

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
      `UPDATE applications SET status = $1 WHERE id = $2
       RETURNING *, (SELECT worker_id FROM applications WHERE id = $2)`,
      [status, request.params.id]
    )
    if (!result.rows[0]) {
      return reply.status(404).send({ error: 'Application not found' })
    }

    const application = result.rows[0]

    const listing = await db.query(
      'SELECT service_type, city, region FROM listings WHERE id = $1',
      [application.listing_id]
    )
    if (listing.rows[0]) {
      const l = listing.rows[0]
      const messages = {
        reviewing: `Your application for ${l.service_type} in ${l.city}, ${l.region} is being reviewed.`,
        matched: `You've been matched for ${l.service_type} in ${l.city}, ${l.region}. We'll be in touch with next steps.`,
        rejected: `Your application for ${l.service_type} in ${l.city}, ${l.region} was not selected this time.`
      }
      if (messages[status]) {
        await db.query(
          'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
          [application.worker_id, messages[status]]
        )
      }
    }

    return reply.send({ application })
  })

}
