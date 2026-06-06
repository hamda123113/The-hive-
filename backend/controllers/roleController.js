const { pool } = require('../db');

async function getRoles(req, res) {
  try {
    const { department_id } = req.query;
    if (department_id) {
      const result = await pool.query(
        `SELECT r.id, r.role_title, r.description, r.department_id, d.dept_name AS department_name, r.created_at
         FROM roles r
         LEFT JOIN departments d ON r.department_id = d.id
         WHERE r.department_id = $1
         ORDER BY r.role_title`,
        [Number(department_id)]
      );
      return res.json(result.rows);
    }

    const result = await pool.query(
      `SELECT r.id, r.role_title, r.description, r.department_id, d.dept_name AS department_name, r.created_at
       FROM roles r
       LEFT JOIN departments d ON r.department_id = d.id
       ORDER BY d.dept_name, r.role_title`
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Get roles error:', error);
    return res.status(500).json({ message: 'Unable to retrieve roles.' });
  }
}

async function createRole(req, res) {
  const { role_title, description, department_id } = req.body;

  if (!role_title || !department_id) {
    return res.status(400).json({ message: 'Role title and department_id are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO roles (role_title, description, department_id)
       VALUES ($1, $2, $3)
       RETURNING id, role_title, description, department_id, created_at`,
      [role_title, description || '', Number(department_id)]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({ message: 'Unable to create role.' });
  }
}

async function deleteRole(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Role not found.' });
    }
    return res.json({ message: 'Role deleted successfully.' });
  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({ message: 'Unable to delete role.' });
  }
}

module.exports = { getRoles, createRole, deleteRole };
