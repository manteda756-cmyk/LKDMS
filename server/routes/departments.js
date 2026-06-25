const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT d.*, COUNT(f.id) as file_count
      FROM departments d
      LEFT JOIN files f ON f.department_id = d.id AND f.is_active = 1
      WHERE d.is_active = 1
      GROUP BY d.id
      ORDER BY d.name_am ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/departments/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM departments WHERE id = ? AND is_active = 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/departments (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name_am, name_or, name_en, slug, description, color, icon } = req.body;
    if (!name_am || !name_en || !slug) {
      return res.status(400).json({ success: false, message: 'name_am, name_en, slug are required' });
    }
    const [result] = await pool.execute(
      'INSERT INTO departments (name_am, name_or, name_en, slug, description, color, icon) VALUES (?,?,?,?,?,?,?)',
      [name_am, name_or || null, name_en, slug, description || null, color || '#1B4F72', icon || 'folder']
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/departments/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name_am, name_or, name_en, slug, description, color, icon } = req.body;
    await pool.execute(
      'UPDATE departments SET name_am=?, name_or=?, name_en=?, slug=?, description=?, color=?, icon=? WHERE id=?',
      [name_am, name_or || null, name_en, slug, description || null, color || '#1B4F72', icon || 'folder', req.params.id]
    );
    res.json({ success: true, message: 'Department updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/departments/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.execute('UPDATE departments SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
