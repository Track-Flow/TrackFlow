const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// ─── Middleware: admin only ───────────────────────────────────────────────────

function requireAdmin(req, res, next) {

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// Returns all users, excluding password hash

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        user_id, user_name, user_email,
        user_role, user_status, department_id,
        created_at, updated_at
      FROM user
      ORDER BY user_role, user_name
    `);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PATCH /api/admin/users/:id ──────────────────────────────────────────────
// Update role and/or status. Sends only the fields that changed.

const VALID_ROLES    = ['end_user', 'tla', 'mss_manager', 'admin'];
const VALID_STATUSES = ['active', 'inactive'];

router.patch('/users/:id', requireAdmin, async (req, res) => {
  const { id }                  = req.params;
  const { user_role, user_status } = req.body;

  // Validate
  if (user_role   && !VALID_ROLES.includes(user_role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
  }
  if (user_status && !VALID_STATUSES.includes(user_status)) {
    return res.status(400).json({ error: `Invalid status. Must be 'active' or 'inactive'.` });
  }

  // Build dynamic SET clause — only update what was sent
  const fields = [];
  const values = [];

  if (user_role)   { fields.push('user_role = ?');   values.push(user_role);   }
  if (user_status) { fields.push('user_status = ?'); values.push(user_status); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update.' });
  }

  values.push(id); // for WHERE clause

  try {
    const [result] = await pool.query(
      `UPDATE user SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return updated user (minus password)
    const [rows] = await pool.query(`
      SELECT user_id, user_name, user_email, user_role, user_status, department_id, created_at, updated_at
      FROM user WHERE user_id = ?
    `, [id]);

    return res.status(200).json({ message: 'User updated.', user: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;