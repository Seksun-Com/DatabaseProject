const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static('web'));
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: "134.209.101.105",
    user: "group3",
    password: "password3",
    database: "db_group3",
    connectionLimit: 10
});

module.exports.pool = pool;

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL Successfully!");
        connection.release();
    } catch (err) {
        console.error("Error connecting to MySQL", err);
    }
}

testConnection();

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

const residentsRoutes = require('./resident');
app.use('/', residentsRoutes);

const contractsRoutes = require('./contract');
app.use('/', contractsRoutes);
const invoicesRoutes = require('./InvoiceDorm');
app.use('/', invoicesRoutes);