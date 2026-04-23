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




module.exports = router;

