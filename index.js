const express = require('express');
const cors = require('cors');
const sql = require('mssql');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Get all contacts
app.get('/contacts', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM contacts');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Add a new contact
app.post('/contacts', async (req, res) => {
    const { name, phone } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phone', sql.NVarChar, phone)
            .query('INSERT INTO contacts (name, phone) VALUES (@name, @phone)');
        res.send({ message: 'Contact added successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete a contact
app.delete('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM contacts WHERE id = @id');
        res.send({ message: 'Contact deleted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
