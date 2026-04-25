const pool = require('../config/db');
const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');


//get all tickets
router.get('/', authenticateToken,async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ticket');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }   
});


//get ticket by id
router.get('/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM ticket WHERE ticket_id = ?', [id]); 
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//create a new ticket

router.post('/', authenticateToken, async (req, res) => {
  const { ticket_title, ticket_description, category_id } = req.body;
  const user_id = req.user.id; // from JWT payload

  // --- Validation ---
  if (!ticket_title || !ticket_description || !category_id) {
    return res.status(400).json({
      error: 'ticket_title, ticket_description, and category_id are required.',
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // --- Resolve department from category ---
    const [categories] = await conn.query(
      'SELECT department_id, category_name FROM categories WHERE category_id = ?',
      [category_id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const { department_id, category_name } = categories[0];
    const isOther = category_name?.toLowerCase() === 'other';

    // --- Insert ticket ---
    const [result] = await conn.query(
      `INSERT INTO tickets 
        (ticket_title, ticket_description, ticket_status, ticket_escalated, user_id, category_id, department_id)
       VALUES (?, ?, 'open', 0, ?, ?, ?)`,
      [
        ticket_title,
        ticket_description,
        user_id,
        category_id,
        isOther ? null : department_id,
      ]
    );

    return res.status(201).json({
      message: 'Ticket created successfully.',
      ticket_id: result.insertId,
    });

  } catch (err) {
    console.error('Create ticket error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    if (conn) conn.release();
  }
});





module.exports = router;

