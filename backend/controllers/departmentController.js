const { pool } = require('../db');

async function getDepartments(req, res) {
  try {
    const result = await pool.query('SELECT id, dept_name, description, dept_head, created_at FROM departments ORDER BY dept_name');
    return res.json(result.rows);
  } catch (error) {
    console.error('Get departments error:', error);
    return res.status(500).json({ message: 'Unable to retrieve departments.' });
  }
}

async function createDepartment(req, res) {
  const { dept_name, description, dept_head } = req.body;

  if (!dept_name) {
    return res.status(400).json({ message: 'Department name is required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO departments (dept_name, description, dept_head) VALUES ($1, $2, $3) RETURNING id, dept_name, description, dept_head, created_at',
      [dept_name, description || '', dept_head || '']
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create department error:', error);
    return res.status(500).json({ message: 'Unable to create department.' });
  }
}

async function updateDepartment(req, res) {
  const { id } = req.params;
  const { dept_name, description, dept_head } = req.body;

  try {
    const result = await pool.query(
      `UPDATE departments
       SET dept_name = $1,
           description = $2,
           dept_head = $3
       WHERE id = $4
       RETURNING id, dept_name, description, dept_head, created_at`,
      [dept_name, description || '', dept_head || '', id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({ message: 'Unable to update department.' });
  }
}

async function deleteDepartment(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    return res.json({ message: 'Department deleted successfully.' });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({ message: 'Unable to delete department.' });
  }
}

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
