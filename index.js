const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS Configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow frontend URL only (update in .env)
    methods: 'GET,POST,DELETE',
    allowedHeaders: 'Content-Type'
}));

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

// **Test Database Connection on Startup**
async function testDBConnection() {
    try {
        let pool = await sql.connect(dbConfig);
        console.log('✅ Database connected successfully');
        pool.close();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}
testDBConnection();

// **Get all contacts**
app.get('/contacts', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM contacts');
        res.json(result.recordset);
        pool.close();
    } catch (err) {
        console.error("Error fetching contacts:", err);
        res.status(500).json({ error: "Failed to fetch contacts", details: err.message });
    }
});

// **Add a new contact**
app.post('/contacts', async (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone are required" });
    }
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phone', sql.NVarChar, phone)
            .query('INSERT INTO contacts (name, phone) VALUES (@name, @phone)');
        res.json({ message: '✅ Contact added successfully' });
        pool.close();
    } catch (err) {
        console.error("Error adding contact:", err);
        res.status(500).json({ error: "Failed to add contact", details: err.message });
    }
});

// **Delete a contact**
app.delete('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Contact ID is required" });
    }
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM contacts WHERE id = @id');
        res.json({ message: '✅ Contact deleted successfully' });
        pool.close();
    } catch (err) {
        console.error("Error deleting contact:", err);
        res.status(500).json({ error: "Failed to delete contact", details: err.message });
    }
});

// **Start the Server**
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
