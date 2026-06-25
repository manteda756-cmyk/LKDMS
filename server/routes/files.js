const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
require('dotenv').config();

// GET /api/files - list with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, department, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['f.is_active = 1'];
    const params = [];

    if (search) {
      where.push('(f.file_number LIKE ? OR f.title_am LIKE ? OR f.title_or LIKE ? OR f.title_en LIKE ? OR f.description LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }
    if (department) {
      where.push('d.slug = ?');
      params.push(department);
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM files f LEFT JOIN departments d ON f.department_id = d.id ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.execute(
      `SELECT f.id, f.file_number, f.title_am, f.title_or, f.title_en, f.description,
              f.file_type, f.file_size, f.upload_date, f.view_count, f.download_count,
              f.file_name, f.file_path,
              d.id as dept_id, d.name_am as dept_name_am, d.name_or as dept_name_or,
              d.name_en as dept_name_en, d.color as dept_color, d.slug as dept_slug
       FROM files f
       LEFT JOIN departments d ON f.department_id = d.id
       ${whereClause}
       ORDER BY CAST(f.file_number AS INTEGER) ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/files/stats
router.get('/stats', async (req, res) => {
  try {
    const [[totals]] = await pool.execute('SELECT COUNT(*) as total_files FROM files WHERE is_active=1');
    const [[withFile]] = await pool.execute('SELECT COUNT(*) as total FROM files WHERE is_active=1 AND file_path IS NOT NULL');
    const [deptStats] = await pool.execute(`
      SELECT d.name_am, d.name_en, d.color, d.slug, COUNT(f.id) as count
      FROM departments d LEFT JOIN files f ON f.department_id=d.id AND f.is_active=1
      WHERE d.is_active=1 GROUP BY d.id ORDER BY count DESC
    `);
    const [recent] = await pool.execute(`
      SELECT f.id, f.file_number, f.title_am, f.title_en, f.file_type, f.upload_date,
             d.name_am as dept_name_am, d.color as dept_color
      FROM files f LEFT JOIN departments d ON f.department_id=d.id
      WHERE f.is_active=1 ORDER BY f.upload_date DESC LIMIT 5
    `);
    res.json({ success: true, data: { ...totals, ...withFile, departments: deptStats, recent_files: recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/files/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT f.*, d.name_am as dept_name_am, d.name_or as dept_name_or,
             d.name_en as dept_name_en, d.color as dept_color, d.slug as dept_slug
      FROM files f LEFT JOIN departments d ON f.department_id=d.id
      WHERE f.id=? AND f.is_active=1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'File not found' });
    await pool.execute('UPDATE files SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/files/:id/download
router.get('/:id/download', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM files WHERE id=? AND is_active=1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'File not found' });
    const file = rows[0];
    if (!file.file_path) return res.status(404).json({ success: false, message: 'No attachment' });
    const filePath = path.resolve(file.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on disk' });
    await pool.execute('UPDATE files SET download_count = download_count + 1 WHERE id = ?', [req.params.id]);
    res.download(filePath, file.file_name || path.basename(filePath));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/files (admin)
router.post('/', authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { file_number, title_am, title_or, title_en, department_id, description } = req.body;
    if (!file_number || !title_am) {
      return res.status(400).json({ success: false, message: 'file_number and title_am required' });
    }
    let file_path = null, file_name = null, file_type = null, file_size = 0;
    if (req.file) {
      file_path = req.file.path;
      file_name = req.file.originalname;
      file_type = path.extname(req.file.originalname).slice(1).toUpperCase();
      file_size = req.file.size;
    }
    const [result] = await pool.execute(
      `INSERT INTO files (file_number,title_am,title_or,title_en,department_id,description,file_path,file_name,file_type,file_size,created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [file_number, title_am, title_or||null, title_en||null, department_id||null, description||null,
       file_path, file_name, file_type, file_size, req.user.id]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'File created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'File number already exists' });
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/files/:id (admin)
router.put('/:id', authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { file_number, title_am, title_or, title_en, department_id, description } = req.body;
    const [existing] = await pool.execute('SELECT * FROM files WHERE id=?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });
    let { file_path, file_name, file_type, file_size } = existing[0];
    if (req.file) {
      if (file_path && fs.existsSync(path.resolve(file_path))) fs.unlinkSync(path.resolve(file_path));
      file_path = req.file.path;
      file_name = req.file.originalname;
      file_type = path.extname(req.file.originalname).slice(1).toUpperCase();
      file_size = req.file.size;
    }
    await pool.execute(
      `UPDATE files SET file_number=?,title_am=?,title_or=?,title_en=?,department_id=?,description=?,
       file_path=?,file_name=?,file_type=?,file_size=? WHERE id=?`,
      [file_number, title_am, title_or||null, title_en||null, department_id||null, description||null,
       file_path, file_name, file_type, file_size, req.params.id]
    );
    res.json({ success: true, message: 'File updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/files/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.execute('UPDATE files SET is_active=0 WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
