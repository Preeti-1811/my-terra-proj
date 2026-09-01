const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME || 'burgerapp',
  user: process.env.DB_USER || 'burgerapp_admin',
  password: process.env.DB_PASSWORD,
});

// Create tables if they don't exist yet, and seed the menu once
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      burger TEXT NOT NULL,
      drink TEXT NOT NULL,
      total NUMERIC NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM menu');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO menu (name, price) VALUES
      ('Veg Burger', 20),
      ('Non-Veg Burger', 30),
      ('Coke', 45),
      ('Limka', 35);
    `);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

app.get('/api/menu', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM menu ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { burger, drink } = req.body;
  try {
    const menuResult = await pool.query('SELECT name, price FROM menu WHERE name IN ($1, $2)', [burger, drink]);
    const total = menuResult.rows.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const { rows } = await pool.query(
      'INSERT INTO orders (burger, drink, total) VALUES ($1, $2, $3) RETURNING *',
      [burger, drink, total]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });