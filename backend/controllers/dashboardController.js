const { pool } = require('../db');

async function getOverview(req, res) {
  try {
    const [summaryResult, caseByDeptResult, caseByEmployeeResult] = await Promise.all([
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE TRUE) AS total_cases,
           COUNT(DISTINCT department_id) AS total_departments,
           COUNT(DISTINCT employee_id) AS total_employees,
           (SELECT COUNT(*) FROM roles) AS total_roles
         FROM cases`
      ),
      pool.query(
        `SELECT d.dept_name AS department, COUNT(c.id) AS case_count
         FROM departments d
         LEFT JOIN cases c ON c.department_id = d.id
         GROUP BY d.id
         ORDER BY case_count DESC`
      ),
      pool.query(
        `SELECT e.employee_name AS employee, COUNT(c.id) AS case_count
         FROM employees e
         LEFT JOIN cases c ON c.employee_id = e.id
         GROUP BY e.id
         ORDER BY case_count DESC`
      )
    ]);

    return res.json({
      totals: summaryResult.rows[0],
      casesByDepartment: caseByDeptResult.rows,
      casesByEmployee: caseByEmployeeResult.rows
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return res.status(500).json({ message: 'Unable to load dashboard data.' });
  }
}

module.exports = { getOverview };
