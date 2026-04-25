const pool = require('../config/db');
const router = require('express').Router();


//get all tickets
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ticket');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }   
});


//get ticket by id
router.get('/:id', async (req, res) => {
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





module.exports = router;

