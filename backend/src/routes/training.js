import express from 'express';
import db from '../services/db.js';
const router = express.Router();

// Improved time formatting utility
const formatTimeForDB = (time) => {
  if (!time || typeof time !== 'string' || time.trim() === '') return null;

  // Allow flexible input formats (H:MM, HH:MM)
  const timeRegex = /^(\d{1,2}):(\d{2})$/;
  const match = time.match(timeRegex);

  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  // Validate time components
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

// Update the SELECT query to handle null times
router.get('/', async (req, res) => {
  try {
    const [flights] = await db.query(`
      SELECT *,
      CASE
        WHEN ata IS NOT NULL AND atd IS NOT NULL
        THEN TIMEDIFF(ata, atd)
        ELSE NULL
      END AS total_flight_time
      FROM training_flights
      ORDER BY date_of_flight DESC
    `);
    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM training_flights WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.status(200).json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Add new training flight
router.post('/', async (req, res) => {
  const { date_of_flight, call_sign, aircraft_type, atd, route, ata, duty, crew } = req.body;

  // Format times for database
  const formattedATD = formatTimeForDB(atd);
  const formattedATA = formatTimeForDB(ata);

  // Time validation
  if ((atd && !formattedATD) || (ata && !formattedATA)) {
    return res.status(400).json({
      message: 'Invalid time format. Please use HH:MM format (24-hour).'
    });
  }

  try {
    const flightData = {
      date_of_flight,
      call_sign,
      aircraft_type,
      atd: formattedATD,
      route: route || null,
      ata: formattedATA,
      duty: duty || null,
      crew: crew || null
    };
    console.log('Inserting flight data:', flightData); // Log for debugging

    const [result] = await db.query(`INSERT INTO training_flights SET ?`, flightData);

    const [newFlight] = await db.query(
      `SELECT *, LEFT(TIMEDIFF(ata, atd), 5) AS total_flight_time
       FROM training_flights WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(newFlight[0]);
  } catch (error) {
    console.error('Database insertion error:', error);
    res.status(500).json({
      message: 'Database operation failed',
      detail: error.sqlMessage
    });
  }
});

// Update training flight - FIXED
router.put('/:id', async (req, res) => {
  try {
    const { id, date_of_flight, call_sign, aircraft_type, atd, route, ata, duty, crew } = req.body;

    // Format times properly
    const formattedATD = formatTimeForDB(atd);
    const formattedATA = formatTimeForDB(ata);

    // Log the formatted times (for debugging)
    console.log('Formatted ATD:', formattedATD);
    console.log('Formatted ATA:', formattedATA);

    // Time validation
    if ((atd && !formattedATD) || (ata && !formattedATA)) {
      return res.status(400).json({
        message: 'Invalid time format. Please use HH:MM format (24-hour).'
      });
    }

    const updateData = {
      date_of_flight,
      call_sign,
      aircraft_type,
      atd: formattedATD,
      route: route || null,
      ata: formattedATA,
      duty: duty || null,
      crew: crew || null
    };

    console.log('Updating flight data:', updateData); // Log for debugging

    const [updateResult] = await db.query('UPDATE training_flights SET ? WHERE id = ?', [updateData, req.params.id]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    const [updatedFlight] = await db.query(
      `SELECT *, LEFT(TIMEDIFF(ata, atd),5) AS total_flight_time
       FROM training_flights WHERE id = ?`,
      [req.params.id]
    );

    if (updatedFlight.length === 0) {
      return res.status(404).json({ message: 'Updated flight not found' });
    }

    res.status(200).json(updatedFlight[0]);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

export default router;