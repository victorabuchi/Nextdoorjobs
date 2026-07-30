'use strict'

const db = require('../db/index')

module.exports = async function notificationsRoutes(fastify) {

  fastify.get('/api/notifications/mine', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [request.user.id]
    )
    return reply.send({ notifications: result.rows })
  })

  fastify.patch('/api/notifications/:id/read', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const result = await db.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [request.params.id, request.user.id]
    )
    if (!result.rows[0]) {
      return reply.status(404).send({ error: 'Notification not found' })
    }
    return reply.send({ notification: result.rows[0] })
  })

  fastify.patch('/api/notifications/read-all', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    await db.query('UPDATE notifications SET read = true WHERE user_id = $1 AND read = false', [request.user.id])
    return reply.send({ ok: true })
  })

}
