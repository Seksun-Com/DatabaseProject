const express = require('express');
const app = express.Router();
const pool = require('./server').pool; // Import pool from server.js

// 1. Retrieve all contracts
app.get('/getAllContracts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Contract');
        res.json(rows);
    } catch (err) {
        console.error("Error retrieving contracts:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 2. Retrieve a contract by ID
app.get('/getContracts', async (req, res) => {
    const searchId = req.query.searchId;
    
    try {
        let query = 'SELECT * FROM Contract WHERE 1=1';
        if (searchId) {
            query += ' AND ContractID = ? OR ResidentID LIKE ? ORDER BY ContractID';
            const [rows] = await pool.query(query, [searchId,searchId]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Contract not found' });
            }
            return res.json(rows); // Return an array of matching invoices
        } else {
            return res.status(400).json({ error: 'Please provide either an ContractID or a ResidentID' });
        }
    } catch (err) {
        console.error("Error retrieving contract:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 3. Add a contract
app.post('/addContract', async (req, res) => {
    const { ContractID, DateIn, DateOut, RoomNumber, ResidentID, EmployeeID } = req.body;
    if (!ContractID || !DateIn || !RoomNumber || !ResidentID || !EmployeeID) {
        return res.status(400).json({ error: 'Missing required contract fields' });
    }
    const query = 'INSERT INTO Contract(ContractID, DateIn, DateOut, RoomNumber, ResidentID, EmployeeID) VALUES(?,?,?,?,?,?)';
    try {
        const [results] = await pool.query(query, [ContractID, DateIn, DateOut, RoomNumber, ResidentID, EmployeeID]);
        res.json({ msg: "Contract added successfully", insertedID: results.insertId });
    } catch (err) {
        console.error("Error inserting contract:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 4. Update a contract
app.put('/updateContract/:id', async (req, res) => {
    const contractId = req.params.id;
    const { DateIn, DateOut, RoomNumber, ResidentID, EmployeeID } = req.body;

    try {
        let updateQuery = 'UPDATE Contract SET ';
        const updateValues = [];

        if (DateIn !== undefined) {
            updateQuery += 'DateIn = ?, ';
            updateValues.push(DateIn);
        }

        if (DateOut !== undefined) {
            updateQuery += 'DateOut = ?, ';
            updateValues.push(DateOut);
        }

        if (RoomNumber !== undefined) {
            updateQuery += 'RoomNumber = ?, ';
            updateValues.push(RoomNumber);
        }

        if (ResidentID !== undefined) {
            updateQuery += 'ResidentID = ?, ';
            updateValues.push(ResidentID);
        }

        if (EmployeeID !== undefined) {
            updateQuery += 'EmployeeID = ?, ';
            updateValues.push(EmployeeID);
        }

        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ' WHERE ContractID = ?';
        updateValues.push(contractId);

        if (updateValues.length > 1) {
            const [results] = await pool.query(updateQuery, updateValues);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Contract not found' });
            }
            res.json({ msg: "Contract updated successfully" });
        } else {
            res.status(400).json({ error: "No fields to update provided." });
        }
    } catch (err) {
        console.error("Error updating contract:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 5. Delete a contract
app.delete('/deleteContract/:id', async (req, res) => {
    const contractId = req.params.id;
    try {
        const [results] = await pool.query('DELETE FROM Contract WHERE ContractID = ?', [contractId]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        res.json({ msg: "Contract deleted successfully" });
    } catch (err) {
        console.error("Error deleting contract:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

module.exports = app;