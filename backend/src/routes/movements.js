import express from 'express';
import db from '../services/db.js';

const router = express.Router();

// GET all aircraft movements (ordered by date of flight descending)
router.get('/', async (req, res) => {
  try {
    const [movements] = await db.query('SELECT * FROM aircraft_movements ORDER BY date_of_flight DESC');
    res.status(200).json(movements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// GET a single movement by its ID
router.get('/id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM aircraft_movements WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Movement not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching movement by id:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// GET movements by date (YYYY-MM-DD)
router.get('/date/:date', async (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
  }
  try {
    const [movements] = await db.query('SELECT * FROM aircraft_movements WHERE date_of_flight = ?', [date]);
    res.status(200).json(movements);
  } catch (error) {
    console.error('Error fetching movements by date:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// POST: Add a new aircraft movement
router.post('/', async (req, res) => {
  const {
    date_of_flight,
    task_number,
    call_sign,
    aircraft_type,
    dept_aerod,
    atd = '',
    enroute_estimates,
    dest_aerod,
    purpose,
    ata = '',
    occurrence_status,
    remarks
  } = req.body;

  // Validate required fields
  if (!date_of_flight || !task_number || !aircraft_type || !purpose) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

  try {
    const [result] = await db.query(
      `INSERT INTO aircraft_movements (
      date_of_flight,
              task_number,
              call_sign,
              aircraft_type,
              dept_aerod,
              atd,
              enroute_estimates,
              dest_aerod,
              purpose,
              ata,
              occurrence_status,
              remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date_of_flight,
        task_number,
        call_sign || null,
        aircraft_type,
        dept_aerod || null,
        atd || null,
        enroute_estimates || null,
        dest_aerod || null,
        purpose,
        ata || null,
        occurrence_status || 'In Progress',
        remarks || null
      ]
    );

    res.status(201).json({
          id: result.insertId,
          ...req.body,
          occurrence_status: occurrence_status || 'In Progress'
        });
      } catch (error) {
        console.error('Error adding movement:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
      }
    });

 // In your backend routes (movements.js)
 router.delete('/:id', async (req, res) => {
   const { id } = req.params;
   try {
     const [result] = await db.query('DELETE FROM aircraft_movements WHERE id = ?', [id]);
     if (result.affectedRows === 0) {
       return res.status(404).json({ message: 'Movement not found' });
     }
     res.status(200).json({ message: 'Movement deleted successfully' });
   } catch (error) {
     console.error('Error deleting movement:', error);
     res.status(500).json({
       message: 'Database error',
       error: error.sqlMessage || error.message
     });
   }
 });

// PUT: Update an existing aircraft movement
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedMovement = req.body;

  // Validate required fields (only essential ones)
  if (!updatedMovement.date_of_flight || !updatedMovement.task_number ||
      !updatedMovement.aircraft_type || !updatedMovement.purpose) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    // Clean time fields
    const cleanedData = {
      ...updatedMovement,
      atd: updatedMovement.atd || null,
      ata: updatedMovement.ata || null
    };

    await db.query('UPDATE aircraft_movements SET ? WHERE id = ?', [cleanedData, id]);
    const [rows] = await db.query('SELECT * FROM aircraft_movements WHERE id = ?', [id]);
    res.status(200).json({
      message: 'Movement updated successfully',
      movement: rows[0]
    });
  } catch (error) {
    console.error('Error updating movement:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

export default router;