// PUT /api/tickets/:id
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { ticket_title, ticket_description, ticket_status, ticket_escalated, category_id, assigned_to } = req.body;
  const requesting_user_id = req.user.id;
  const requesting_user_role = req.user.role;

  let conn;
  try {
    conn = await pool.getConnection();

    // --- Check ticket exists ---
    const [tickets] = await conn.query('SELECT * FROM tickets WHERE ticket_id = ?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    // --- Authorisation rules ---
    // Staff can only update their own tickets, and only title/description while status is 'open'
    if (requesting_user_role === 'staff') {
      if (ticket.user_id !== requesting_user_id) {
        return res.status(403).json({ error: 'You are not authorised to update this ticket.' });
      }
      if (ticket.ticket_status !== 'open') {
        return res.status(403).json({ error: 'You can only edit tickets that are still open.' });
      }
    }

    // --- Build dynamic update fields ---
    const fields = [];
    const values = [];

    if (ticket_title !== undefined) {
      fields.push('ticket_title = ?');
      values.push(ticket_title);
    }

    if (ticket_description !== undefined) {
      fields.push('ticket_description = ?');
      values.push(ticket_description);
    }

    // Only technicians/managers/admins can update status, escalation, and assignment
    if (requesting_user_role !== 'staff') {
      if (ticket_status !== undefined) {
        const validStatuses = ['open', 'in_progress', 'escalated', 'resolved', 'closed'];
        if (!validStatuses.includes(ticket_status)) {
          return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }
        fields.push('ticket_status = ?');
        values.push(ticket_status);
      }

      if (ticket_escalated !== undefined) {
        fields.push('ticket_escalated = ?');
        values.push(ticket_escalated ? 1 : 0);
      }

      if (assigned_to !== undefined) {
        // Verify the assigned user exists and is a technician
        const [assignee] = await conn.query(
          'SELECT user_id FROM users WHERE user_id = ? AND role = ?',
          [assigned_to, 'technician']
        );
        if (assignee.length === 0) {
          return res.status(404).json({ error: 'Assigned technician not found.' });
        }
        fields.push('assigned_to = ?');
        values.push(assigned_to);
      }

      if (category_id !== undefined) {
        const [categories] = await conn.query(
          'SELECT department_id, category_name FROM categories WHERE category_id = ?',
          [category_id]
        );
        if (categories.length === 0) {
          return res.status(404).json({ error: 'Category not found.' });
        }
        const { department_id, category_name } = categories[0];
        const isOther = category_name?.toLowerCase() === 'other';

        fields.push('category_id = ?');
        values.push(category_id);
        fields.push('department_id = ?');
        values.push(isOther ? null : department_id);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    // --- Add updated_at timestamp ---
    fields.push('updated_at = NOW()');

    // --- Execute update ---
    values.push(id);
    await conn.query(
      `UPDATE tickets SET ${fields.join(', ')} WHERE ticket_id = ?`,
      values
    );

    // --- Return updated ticket ---
    const [updated] = await conn.query('SELECT * FROM tickets WHERE ticket_id = ?', [id]);
    return res.status(200).json({
      message: 'Ticket updated successfully.',
      ticket: updated[0],
    });

  } catch (err) {
    console.error('Update ticket error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    if (conn) conn.release();
  }
});