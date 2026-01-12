const express = require('express');
const app = express.Router();
const pool = require('./server').pool;

// 1. Retrieve all invoices
app.get('/getAllInvoices', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM InvoiceDorm');
        res.json(rows);
    } catch (err) {
        console.error("Error retrieving invoices:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 2. Retrieve an invoice by searchId
app.get('/getInvoices', async (req, res) => {
    const searchId = req.query.searchId;

    try {
        let query = 'SELECT * FROM InvoiceDorm WHERE 1=1'; // Start with a true condition
        if (searchId) {
            query += ' AND InvoiceID = ? OR ResidentID LIKE ? ORDER BY InvoiceID';
            const [rows] = await pool.query(query, [searchId, searchId]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Invoice not found' });
            }
            return res.json(rows); // Return an array of matching invoices
        } else {
            return res.status(400).json({ error: 'Please provide either an InvoiceID or a ResidentID' });
        }
    } catch (err) {
        console.error("Error retrieving invoice:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 3. Add an invoice
app.post('/addInvoices', async (req, res) => {
    const { InvoiceID, WaterCost, ElectricityCost, Rent, TotalAmount, RoomNumber, ResidentID } = req.body;
    if (!InvoiceID || !WaterCost || !ElectricityCost || !Rent || !TotalAmount || !RoomNumber || !ResidentID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO InvoiceDorm(InvoiceID, RoomNumber, ResidentID, WaterCost, ElectricityCost, Rent, TotalAmount) VALUES(?,?,?,?,?,?,?)';
    try {
        const [results] = await pool.query(query, [InvoiceID, RoomNumber, ResidentID, WaterCost, ElectricityCost, Rent, TotalAmount]);
        res.json({ msg: "Invoice added successfully", insertedID: results.insertId });
    } catch (err) {
        console.error("Error inserting invoice:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 4. Update an invoice
app.put('/updateInvoices/:id', async (req, res) => {
    const invoiceId = req.params.id;
    const { RoomNumber, ResidentID, WaterCost, ElectricityCost, Rent} = req.body;

    try {
        let updateQuery = 'UPDATE InvoiceDorm SET ';
        const updateValues = [];

        if (RoomNumber !== undefined) {
            updateQuery += 'RoomNumber = ?, ';
            updateValues.push(RoomNumber);
        }

        if (ResidentID !== undefined) {
            updateQuery += 'ResidentID = ?, ';
            updateValues.push(ResidentID);
        }

        if (WaterCost !== undefined) {
            updateQuery += 'WaterCost = ?, ';
            updateValues.push(WaterCost);
        }

        if (ElectricityCost !== undefined) {
            updateQuery += 'ElectricityCost = ?, ';
            updateValues.push(ElectricityCost);
        }

        if (Rent !== undefined) {
            updateQuery += 'Rent = ?, ';
            updateValues.push(Rent);
        }
        updateQuery = updateQuery.slice(0, -2); // Remove the trailing comma
        updateQuery += ' WHERE InvoiceID = ?';
        updateValues.push(invoiceId);

        if (updateValues.length > 1) {
            const [results] = await pool.query(updateQuery, updateValues);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Invoice not found' });
            }
            //Recalculate total amount and update it.
            const [rows] = await pool.query('SELECT WaterCost, ElectricityCost, Rent FROM InvoiceDorm WHERE InvoiceID = ?', [invoiceId]);
            const totalAmount = parseFloat(rows[0].WaterCost) + parseFloat(rows[0].ElectricityCost) + parseFloat(rows[0].Rent);
            await pool.query('UPDATE InvoiceDorm SET TotalAmount = ? WHERE InvoiceID = ?', [totalAmount, invoiceId]);

            res.json({ msg: "Invoice updated successfully" });
        } else {
            res.status(400).json({ error: "No fields to update provided." });
        }
    } catch (err) {
        console.error("Error updating invoice:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 5. Delete an invoice
app.delete('/deleteInvoices/:id', async (req, res) => {
    const invoiceId = req.params.id;
    try {
        const [results] = await pool.query('DELETE FROM InvoiceDorm WHERE InvoiceID = ?', [invoiceId]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json({ msg: "Invoice deleted successfully" });
    } catch (err) {
        console.error("Error deleting invoice:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

module.exports = app;
