require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3033;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

(async function prepareProductImageColumn() {
  try {
    await pool.query('ALTER TABLE Inventory MODIFY COLUMN image_url LONGTEXT NULL');
  } catch (err) {
    console.error('Inventory image_url column setup failed:', err.message);
  }
})();

// Test Connection
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

// ตาราง Users อยู่ในฐานข้อมูลเดียวกับ Inventory
const USERS_TABLE = 'Users';

// สร้างตาราง Users (ถ้ายังไม่มี) ตาม schema ที่มีอยู่แล้ว + สร้างบัญชี admin เริ่มต้นให้อัตโนมัติ
(async function setupUsersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${USERS_TABLE} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        role VARCHAR(20) NOT NULL DEFAULT 'user'
      )
    `);

    const [admins] = await pool.query(`SELECT id FROM ${USERS_TABLE} WHERE role = ? LIMIT 1`, ['admin']);
    if (admins.length === 0) {
      await pool.query(
        `INSERT INTO ${USERS_TABLE} (username, password, email, role) VALUES (?, ?, ?, ?)`,
        ['admin', hashPassword('admin123'), 'admin@inventory.local', 'admin']
      );
      console.log('Seeded default admin account -> username: admin / password: admin123');
    }
  } catch (err) {
    console.error('Users table setup failed:', err.message);
  }
})();

// เข้ารหัส/ตรวจสอบรหัสผ่านด้วย Node crypto (scrypt) ไม่ต้องลง package เพิ่ม
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, 'hex');
  const suppliedBuffer = crypto.scryptSync(password, salt, 64);
  if (hashBuffer.length !== suppliedBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, suppliedBuffer);
}

// API Routes
app.get("/api", (req, res) => {
  res.send("API is running");
});

// POST (สมัครสมาชิกใหม่) - บทบาทเริ่มต้นเป็น user เสมอ ป้องกันการตั้งตัวเองเป็น admin
app.post('/api/register', async (req, res) => {
  try {
    const b = req.body || {};
    const username = (b.username || '').trim();
    const email = (b.email || '').trim();
    const password = b.password || '';

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const [existing] = await pool.query(
      `SELECT id FROM ${USERS_TABLE} WHERE username = ? OR email = ?`,
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'มีชื่อผู้ใช้หรืออีเมลนี้ในระบบแล้ว' });
    }

    const [result] = await pool.query(
      `INSERT INTO ${USERS_TABLE} (username, password, email, role) VALUES (?, ?, ?, ?)`,
      [username, hashPassword(password), email, 'user']
    );

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกเรียบร้อยแล้ว',
      user: { id: result.insertId, username, email, role: 'user' },
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST (เข้าสู่ระบบ)
app.post('/api/login', async (req, res) => {
  try {
    const b = req.body || {};
    const username = (b.username || '').trim();
    const password = b.password || '';

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอก Username และ Password' });
    }

    const [rows] = await pool.query(
      `SELECT id, username, email, password, role FROM ${USERS_TABLE} WHERE username = ? OR email = ?`,
      [username, username]
    );

    if (rows.length === 0 || !verifyPassword(password, rows[0].password)) {
      return res.status(401).json({ success: false, message: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    const user = rows[0];
    res.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET ทั้งหมด
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Inventory ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET รายชิ้น
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

// POST (สร้างสินค้าใหม่)
app.post('/api/products', async (req, res) => {
  try {
    const b = req.body || {};
    const name = b.name || b.Name;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Missing name' });

    const sql = `
      INSERT INTO Inventory (name, stock, price, category, location, status, image_url, productCode, lastUpdate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [
      name.trim(),
      Number(b.stock) || 0,
      b.price !== undefined && b.price !== '' ? Number(b.price) : null,
      b.category || b.Category || null,
      b.location || b.location_text || b.Location || null,
      b.status || b.badge_status || b.Status || 'Active',
      b.image_url || b.image || b.Image || null,
      b.productCode || b.Productcode || null,
    ]);

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT (แก้ไขสินค้า)
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
      SET name = ?, stock = ?, price = ?, category = ?, location = ?, status = ?, image_url = COALESCE(?, image_url), productCode = ?, lastUpdate = NOW()
      WHERE id = ? OR productCode = ?
    `;
    
    await pool.query(sql, [
      name.trim(),
      Number(b.stock) || 0,
      b.price !== undefined && b.price !== '' ? Number(b.price) : null,
      b.category || b.Category || null,
      b.location || b.location_text || b.Location || null,
      b.status || b.badge_status || b.Status || 'Active',
      b.image_url || b.image || b.Image || null,
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

// DELETE (ลบสินค้าออก DB)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const bodyId = req.body?.id || req.body?.productCode || rawId;
    
    // ค้นหา ID ที่แท้จริงใน DB ก่อนลบ
    const [rows] = await pool.query(
      'SELECT id FROM Inventory WHERE id = ? OR productCode = ? OR id = ? OR productCode = ?', 
      [rawId, rawId, bodyId, bodyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบสินค้าในระบบ' });
    }

    const realDbId = rows[0].id;
    const [result] = await pool.query('DELETE FROM Inventory WHERE id = ?', [realDbId]);

    if (result.affectedRows > 0) {
      return res.json({ success: true, message: 'ลบข้อมูลสำเร็จ', deletedId: realDbId });
    } else {
      return res.status(400).json({ success: false, message: 'ไม่สามารถลบรายการนี้ได้' });
    }
  } catch (error) {
    console.error('DELETE Error:', error.message);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        success: false, 
        error: 'ไม่สามารถลบได้เนื่องจากสินค้านี้ถูกใช้อ้างอิงอยู่ในตารางอื่น' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${port}`);
});