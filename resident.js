const express = require('express');
const app = express.Router();
const pool = require('./server').pool;
// 1. Retrieve all residents
app.get('/getAllResidents', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT r.ResidentID, r.ResidentName, r.TelNumber, r.Contact, i.RoomNumber FROM Resident r LEFT JOIN InvoiceDorm i ON r.ResidentID = i.ResidentID ORDER BY r.ResidentID');
        res.json(rows);
    } catch (err) {
        console.error("Error retrieving residents:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 2. Retrieve a resident by ID or Name
app.get('/getResidents', async (req, res) => {
    const residentId = req.query.id;
    const residentName = req.query.name;

    try {
        let query = 'SELECT r.ResidentID, r.ResidentName, r.TelNumber, r.Contact, i.RoomNumber FROM Resident r LEFT JOIN InvoiceDorm i ON r.ResidentID = i.ResidentID WHERE 1=1'; // Start with a true condition

        if (residentId) {
            query += ' AND r.ResidentID = ? ORDER BY r.ResidentID';
            const [rows] = await pool.query(query, [residentId]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Resident not found' });
            }
            return res.json(rows);
        } else if (residentName) {
            query += ' AND r.ResidentName LIKE ? ORDER BY r.ResidentID';
            const likeTerm = `%${residentName}%`;
            const [rows] = await pool.query(query, [likeTerm]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Resident not found' });
            }
            return res.json(rows); // Return an array of matching residents
        } else {
            return res.status(400).json({ error: 'Please provide either an ID or a Name' });
        }
    } catch (err) {
        console.error("Error retrieving resident:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 3. Add a resident
app.post('/addResident', async (req, res) => {
    const { ResidentID, ResidentName, TelNumber, Contact } = req.body;
    if (!ResidentID || !ResidentName) {
        return res.status(400).json({ error: 'Missing ResidentID or ResidentName' });
    }
    const query = 'INSERT INTO Resident(ResidentID, ResidentName, TelNumber, Contact) VALUES(?,?,?,?)';
    try {
        const [results] = await pool.query(query, [ResidentID, ResidentName, TelNumber, Contact]);
        res.json({ msg: "Data inserted successfully", insertedID: results.insertId });
    } catch (err) {
        console.error("Error inserting data: ", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 4. Update a resident
app.put('/updateResident/:id', async (req, res) => {
    const residentId = req.params.id;
    const { ResidentName, TelNumber, Contact } = req.body;

    try {
        let updateQuery = 'UPDATE Resident SET ';
        const updateValues = [];

        if (ResidentName !== undefined) {
            updateQuery += 'ResidentName = ?, ';
            updateValues.push(ResidentName);
        }

        if (TelNumber !== undefined) {
            updateQuery += 'TelNumber = ?, ';
            updateValues.push(TelNumber);
        }

        if (Contact !== undefined) {
            updateQuery += 'Contact = ?, ';
            updateValues.push(Contact);
        }

        updateQuery = updateQuery.slice(0, -2);

        updateQuery += ' WHERE ResidentID = ?';
        updateValues.push(residentId);

        if (updateValues.length > 1) {
            const [results] = await pool.query(updateQuery, updateValues);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Resident not found' });
            }
            res.json({ msg: "Resident updated successfully" });
        } else {
            res.status(400).json({ error: "No fields to update provided." });
        }

    } catch (err) {
        console.error("Error updating resident:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 5. Delete a resident
app.delete('/deleteResident/:id', async (req, res) => {
    const residentId = req.params.id;
    try {
        const [results] = await pool.query('DELETE FROM Resident WHERE ResidentID = ?', [residentId]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Resident not found' });
        }
        res.json({ msg: "Resident deleted successfully" });
    } catch (err) {
        console.error("Error deleting resident:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

module.exports = app;