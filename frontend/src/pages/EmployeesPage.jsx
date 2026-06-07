import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Pagination from '../components/Pagination.jsx';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editRoles, setEditRoles] = useState([]);
  const [savingEmployeeEdit, setSavingEmployeeEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const [empResp, deptResp, roleResp] = await Promise.all([api.get('/employees'), api.get('/departments'), api.get('/roles')]);
        setEmployees(empResp.data);
        setDepartments(deptResp.data);
        setRoles(roleResp.data);
      } catch (err) {
        console.error('Failed to load employees data', err);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [employees.length]);

  const departmentById = departments.reduce((map, dept) => ({ ...map, [dept.id]: dept }), {});

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
        role_id: Number(editEmployee.role_id),
      });
      setEmployees((prev) => prev.map((item) => (item.id === resp.data.id ? {
        ...item,
        employee_name: resp.data.employee_name,
        email: resp.data.email,
        department_id: resp.data.department_id,
        department_name: departmentById[resp.data.department_id]?.dept_name || item.department_name,
        role_id: resp.data.role_id,
        role_title: editRoles.find((role) => role.id === resp.data.role_id)?.role_title || item.role_title,
      } : item)));
      closeModal();
    } catch (error) {
      console.error('Failed to save employee changes:', error);
      alert('Unable to save employee changes.');
    } finally {
      setSavingEmployeeEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees((prev) => prev.filter((e) => e.id !== id));
      } catch (error) {
        console.error('Failed to delete employee:', error);
        alert('Unable to delete employee.');
      }
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => a.employee_name.localeCompare(b.employee_name));
  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));
  const currentItems = sortedEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Employee management</h1>
          <p className="text-muted">View employees and navigate to the employee onboarding form.</p>
        </div>
        <Link to="/employees/new">
          <button className="primary" type="button">Create employee</button>
        </Link>
      </div>

      <div className="panel table-wrapper">
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
            {currentItems.map((employee) => (
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
            {!currentItems.length && (
              <tr>
                <td colSpan="5" style={{ color: '#94a3b8', padding: '24px' }}>No employees registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
