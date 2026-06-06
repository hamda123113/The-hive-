import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function CaseCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const resp = await api.get('/departments');
        setDepartments(resp.data);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    }
    loadDepartments();
  }, []);

  useEffect(() => {
    async function loadEmployeesForDept() {
      if (!departmentId) {
        setEmployees([]);
        return;
      }
      try {
        const resp = await api.get(`/employees?department_id=${departmentId}`);
        setEmployees(resp.data);
      } catch (err) {
        console.error('Failed to load employees for department', err);
      }
    }
    loadEmployeesForDept();
  }, [departmentId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !departmentId || !employeeId) {
      setError('Title, department, and assigned employee are required.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/cases', {
        title,
        description,
        recommendation,
        department_id: Number(departmentId),
        employee_id: Number(employeeId)
      });
      navigate('/cases');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create case.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Create new case</h1>
          <p className="text-muted">Generate a system-owned case reference and assign it to a department and employee.</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '100%' }}>
        <form className="grid-gap" onSubmit={handleSubmit}>
          <label>
            Case title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a case title" type="text" />
          </label>
          <label>
            Case description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" placeholder="Describe the incident or issue" />
          </label>
          <label>
            Assigned department
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
              ))}
            </select>
          </label>
          <label>
            Assigned employee
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.employee_name}</option>
              ))}
            </select>
          </label>
          <label>
            Recommendation for responder
            <textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows="4" placeholder="Write analyst guidance for the team" />
          </label>
          {error && <div style={{ color: '#f87171' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create case'}</button>
            <button className="ghost" type="button" onClick={() => navigate('/cases')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
