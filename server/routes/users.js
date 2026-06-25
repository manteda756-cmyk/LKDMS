const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/users (superadmin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users (superadmin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'username, email, password required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?,?,?,?,?)',
      [username, email, hash, full_name || null, role || 'viewer']
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'User already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/:id (superadmin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { full_name, role, is_active, password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.execute('UPDATE users SET full_name=?, role=?, is_active=?, password_hash=? WHERE id=?',
        [full_name, role, is_active, hash, req.params.id]);
    } else {
      await pool.execute('UPDATE users SET full_name=?, role=?, is_active=? WHERE id=?',
        [full_name, role, is_active, req.params.id]);
    }
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (req.params.id == req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }
    await pool.execute('UPDATE users SET is_active=0 WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
