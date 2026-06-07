const { pool } = require('../db');
const { createCaseId } = require('../utils/generateCaseId');
const { sendMail, buildCaseAssignmentEmail } = require('../utils/mailer');

async function getCases(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         c.id,
         c.case_reference,
         c.title,
         c.status,
         c.recommendation,
         c.created_at,
         d.dept_name AS department,
         e.employee_name AS assigned_employee
       FROM cases c
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN employees e ON c.employee_id = e.id
       ORDER BY c.created_at DESC`
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Get cases error:', error);
    return res.status(500).json({ message: 'Unable to retrieve case list.' });
  }
}

async function getCaseById(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         c.id,
         c.case_reference,
         c.title,
         c.description,
         c.recommendation,
         c.status,
         c.created_at,
         c.updated_at,
         d.id AS department_id,
         d.dept_name AS department,
         e.id AS employee_id,
         e.employee_name AS assigned_employee
       FROM cases c
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN employees e ON c.employee_id = e.id
       WHERE c.id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get case by id error:', error);
    return res.status(500).json({ message: 'Unable to retrieve case details.' });
  }
}

async function createCase(req, res) {
  const { title, description, department_id, employee_id, recommendation } = req.body;

  if (!title || !department_id || !employee_id) {
    return res.status(400).json({ message: 'Title, department, and assigned employee are required.' });
  }

  try {
    const caseReference = createCaseId();
    const result = await pool.query(
      `INSERT INTO cases (case_reference, title, description, recommendation, department_id, employee_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, case_reference, title, description, recommendation, status, created_at`,
      [caseReference, title, description || '', recommendation || '', department_id, employee_id, req.user.id]
    );

    const createdCase = result.rows[0];
    const employeeResult = await pool.query(
      `SELECT e.employee_name, e.email, d.dept_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = $1`,
      [employee_id]
    );

    if (employeeResult.rows.length) {
      const assignee = employeeResult.rows[0];
      const { text, html } = buildCaseAssignmentEmail({
        assigneeName: assignee.employee_name,
        caseReference,
        title,
        department: assignee.dept_name,
        description,
        recommendation,
      });

      try {
        await sendMail({
          to: assignee.email,
          subject: `New case assigned: ${caseReference}`,
          text,
          html,
        });
      } catch (mailError) {
        console.error('Failed to send assignment email:', mailError);
      }
    }

    return res.status(201).json(createdCase);
  } catch (error) {
    console.error('Create case error:', error);
    return res.status(500).json({ message: 'Unable to create case.' });
  }
}

async function updateCase(req, res) {
  const { id } = req.params;
  const { title, description, department_id, employee_id, recommendation, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cases
       SET title = $1,
           description = $2,
           recommendation = $3,
           department_id = $4,
           employee_id = $5,
           status = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, case_reference, title, description, recommendation, status, updated_at`,
      [title, description || '', recommendation || '', department_id, employee_id, status || 'New', id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update case error:', error);
    return res.status(500).json({ message: 'Unable to update case.' });
  }
}

async function deleteCase(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cases WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Case not found.' });
    }
    return res.json({ message: 'Case deleted successfully.' });
  } catch (error) {
    console.error('Delete case error:', error);
    return res.status(500).json({ message: 'Unable to delete case.' });
  }
}

module.exports = { getCases, getCaseById, createCase, updateCase, deleteCase };
