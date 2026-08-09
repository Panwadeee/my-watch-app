require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3033;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
});

(async function testMySQL() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to MySQL:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('MySQL Failed:', err.message);
    process.exit(1);
  }
})();

app.get("/api", (req, res) => {
  res.send("API is running");
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Inventory ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM Inventory WHERE id = ? OR productCode = ?', [id, id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const b = req.body || {};
    const name = b.name || b.Name;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Missing name' });

    const sql = `
      INSERT INTO Inventory (name, stock, price, category, location, status, image, productCode, lastUpdate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [
      name.trim(),
      Number(b.stock) || 0,
      b.price !== undefined && b.price !== '' ? Number(b.price) : null,
      b.category || b.Category || null,
      b.location || b.location_text || b.Location || null,
      b.status || b.badge_status || b.Status || 'Active',
      b.image || b.image_url || b.Image || null,
      b.productCode || b.Productcode || null,
    ]);

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const b = req.body || {};
    const name = b.name || b.Name;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Missing name' });

    const [rows] = await pool.query('SELECT id FROM Inventory WHERE id = ? OR productCode = ?', [id, id]);
    let targetDbId = rows.length > 0 ? rows[0].id : id;

    const sql = `
      UPDATE Inventory 
      SET name = ?, stock = ?, price = ?, category = ?, location = ?, status = ?, image = ?, productCode = ?, lastUpdate = NOW()
      WHERE id = ? OR productCode = ?
    `;
    
    await pool.query(sql, [
      name.trim(),
      Number(b.stock) || 0,
      b.price !== undefined && b.price !== '' ? Number(b.price) : null,
      b.category || b.Category || null,
      b.location || b.location_text || b.Location || null,
      b.status || b.badge_status || b.Status || 'Active',
      b.image || b.image_url || b.Image || null,
      b.productCode || b.Productcode || null,
      targetDbId,
      id,
    ]);

    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('PUT Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Inventory WHERE id = ? OR productCode = ?', [req.params.id, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${port}`);
});