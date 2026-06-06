const { pool } = require('../db');

async function getEmployees(req, res) {
  try {
    const { department_id } = req.query;
    const args = [];
    let where = '';
    if (department_id) {
      where = 'WHERE e.department_id = $1';
      args.push(Number(department_id));
    }

    const query = 
      `SELECT
         e.id,
         e.employee_name,
         e.email,
         r.id AS role_id,
         r.role_title AS role_title,
         d.id AS department_id,
         d.dept_name AS department_name,
         e.created_at
       FROM employees e
       LEFT JOIN roles r ON e.role_id = r.id
       LEFT JOIN departments d ON e.department_id = d.id
       ${where}
       ORDER BY e.employee_name`;

    const result = await pool.query(query, args);
    return res.json(result.rows);
  } catch (error) {
    console.error('Get employees error:', error);
    return res.status(500).json({ message: 'Unable to retrieve employees.' });
  }
}

async function createEmployee(req, res) {
  const { employee_name, email, department_id, role_id } = req.body;

  if (!employee_name || !email || !department_id || !role_id) {
    return res.status(400).json({ message: 'Employee name, email, department and role are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO employees (employee_name, email, department_id, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, employee_name, email, department_id, role_id, created_at`,
      [employee_name, email.toLowerCase(), Number(department_id), Number(role_id)]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create employee error:', error);
    return res.status(500).json({ message: 'Unable to create employee.' });
  }
}

async function updateEmployee(req, res) {
  const { id } = req.params;
  const { employee_name, email, department_id, role_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees
       SET employee_name = $1,
           email = $2,
           department_id = $3,
           role_id = $4
       WHERE id = $5
       RETURNING id, employee_name, email, department_id, role_id, created_at`,
      [employee_name, email.toLowerCase(), Number(department_id), Number(role_id), id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({ message: 'Unable to update employee.' });
  }
}

async function deleteEmployee(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    return res.json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return res.status(500).json({ message: 'Unable to delete employee.' });
  }
}

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };
