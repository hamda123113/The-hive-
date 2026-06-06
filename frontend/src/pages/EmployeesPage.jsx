import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [empResp, deptResp] = await Promise.all([
          api.get('/employees'),
          api.get('/departments')
        ]);
        setEmployees(empResp.data);
        setDepartments(deptResp.data);
      } catch (err) {
        console.error('Failed to load employees data', err);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadRolesForDept() {
      if (!departmentId) {
        setRoles([]);
        return;
      }
      try {
        const resp = await api.get(`/roles?department_id=${departmentId}`);
        setRoles(resp.data);
      } catch (err) {
        console.error('Failed to load roles for department', err);
      }
    }

    loadRolesForDept();
  }, [departmentId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!name || !email || !departmentId || !roleId) {
      setError('All fields are required to add a new employee.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/employees', {
        employee_name: name,
        email,
        department_id: Number(departmentId),
        role_id: Number(roleId)
      });
      setEmployees((prev) => [...prev, {
        ...response.data,
        department_name: departments.find((dept) => dept.id === Number(departmentId))?.dept_name,
        role_title: roles.find((role) => role.id === Number(roleId))?.role_title
      }]);
      setName('');
      setEmail('');
      setDepartmentId('');
      setRoleId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add employee.');
    } finally {
      setSaving(false);
    }
  };

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editRoles, setEditRoles] = useState([]);
  const [savingEmployeeEdit, setSavingEmployeeEdit] = useState(false);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter(e => e.id !== id));
      } catch (error) {
        console.error('Failed to delete employee:', error);
        alert('Unable to delete employee.');
      }
    }
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setEditEmployee(null);
    setEditRoles([]);
    setModalMode(null);
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('view');
  };

  const handleEdit = async (employee) => {
    setEditEmployee({ ...employee });
    setModalMode('edit');
    if (employee.department_id) {
      try {
        const resp = await api.get(`/roles?department_id=${employee.department_id}`);
        setEditRoles(resp.data);
      } catch (err) {
        console.error('Failed to load roles for edit', err);
      }
    }
  };

  const handleEditRoleLoad = async (deptId) => {
    if (!deptId) {
      setEditRoles([]);
      return;
    }
    try {
      const resp = await api.get(`/roles?department_id=${deptId}`);
      setEditRoles(resp.data);
    } catch (err) {
      console.error('Failed to load roles for department', err);
    }
  };

  const handleEditChange = (field, value) => {
    setEditEmployee((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (field === 'department_id') {
        updated.role_id = '';
      }
      return updated;
    });
    if (field === 'department_id') {
      handleEditRoleLoad(Number(value));
    }
  };

  const handleSaveEmployee = async (event) => {
    event.preventDefault();
    if (!editEmployee) return;
    setSavingEmployeeEdit(true);
    try {
      const resp = await api.put(`/employees/${editEmployee.id}`, {
        employee_name: editEmployee.employee_name,
        email: editEmployee.email,
        department_id: Number(editEmployee.department_id),
        role_id: Number(editEmployee.role_id)
      });
      setEmployees((prev) => prev.map((item) => item.id === resp.data.id
        ? {
          ...item,
          employee_name: resp.data.employee_name,
          email: resp.data.email,
          department_id: resp.data.department_id,
          department_name: departments.find((d) => d.id === resp.data.department_id)?.dept_name || item.department_name,
          role_id: resp.data.role_id,
          role_title: editRoles.find((role) => role.id === resp.data.role_id)?.role_title || item.role_title
        }
        : item));
      closeModal();
    } catch (error) {
      console.error('Failed to save employee changes:', error);
      alert('Unable to save employee changes.');
    } finally {
      setSavingEmployeeEdit(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Employee management</h1>
          <p className="text-muted">Add and review employees assigned to departments and roles.</p>
        </div>
      </div>

      <div className="panel table-wrapper" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employee_name}</td>
                <td>{employee.email}</td>
                <td>{employee.department_name || 'Unassigned'}</td>
                <td>{employee.role_title || 'Unassigned'}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button className="ghost icon-button" onClick={() => handleView(employee)} type="button" aria-label="View employee">👁️</button>
                  <button className="ghost icon-button" onClick={() => handleEdit(employee)} type="button" aria-label="Edit employee">✏️</button>
                  <button className="ghost icon-button" style={{ color: '#ef4444' }} onClick={() => handleDelete(employee.id)} type="button" aria-label="Delete employee">🗑️</button>
                </td>
              </tr>
            ))}
            {!employees.length && (
              <tr>
                <td colSpan="5" style={{ color: '#94a3b8', padding: '24px' }}>No employees registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ maxWidth: '100%' }}>
        <h2 className="heading-sm">Add new employee</h2>
        <form className="grid-gap" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <label>
            Employee name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" type="text" />
          </label>
          <label>
            Email address
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" type="email" />
          </label>
          <label>
            Department
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
              ))}
            </select>
          </label>
          <label>
            Role
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.role_title}</option>
              ))}
            </select>
          </label>
          {error && <div style={{ color: '#f87171' }}>{error}</div>}
          <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add employee'}</button>
        </form>
      </div>

      {(modalMode === 'view' || modalMode === 'edit') && (selectedEmployee || editEmployee) && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'view' ? 'Employee details' : 'Edit employee'}</h3>
              <button className="ghost icon-button" type="button" onClick={closeModal} aria-label="Close modal">×</button>
            </div>

            {modalMode === 'view' ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div className="detail-row">
                  <div className="detail-label">Name</div>
                  <div className="detail-value">{selectedEmployee.employee_name}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selectedEmployee.email}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Department</div>
                  <div className="detail-value">{selectedEmployee.department_name || 'Unassigned'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Role</div>
                  <div className="detail-value">{selectedEmployee.role_title || 'Unassigned'}</div>
                </div>
              </div>
            ) : (
              <form className="grid-gap" onSubmit={handleSaveEmployee}>
                <label>
                  Employee name
                  <input value={editEmployee.employee_name} onChange={(e) => handleEditChange('employee_name', e.target.value)} type="text" />
                </label>
                <label>
                  Email address
                  <input value={editEmployee.email} onChange={(e) => handleEditChange('email', e.target.value)} type="email" />
                </label>
                <label>
                  Department
                  <select value={editEmployee.department_id || ''} onChange={(e) => handleEditChange('department_id', e.target.value)}>
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Role
                  <select value={editEmployee.role_id || ''} onChange={(e) => handleEditChange('role_id', e.target.value)}>
                    <option value="">Select role</option>
                    {editRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.role_title}</option>
                    ))}
                  </select>
                </label>
                <div className="button-row">
                  <button className="primary" type="submit" disabled={savingEmployeeEdit}>{savingEmployeeEdit ? 'Saving…' : 'Save changes'}</button>
                  <button className="ghost cancel" type="button" onClick={closeModal}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
