import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editCaseData, setEditCaseData] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    async function loadCases() {
      try {
        const response = await api.get('/cases');
        setCases(response.data);
      } catch (error) {
        console.error('Case list failed', error);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this case?')) {
      try {
        await api.delete(`/cases/${id}`);
        setCases(cases.filter(c => c.id !== id));
      } catch (error) {
        console.error('Failed to delete case:', error);
        alert('Unable to delete case.');
      }
    }
  };

  const renderStatus = (status) => {
    const normalized = (status || 'New').toLowerCase().replace(/\s+/g, '-');
    return (
      <span className={`status-pill status-${normalized}`}>
        {status || 'New'}
      </span>
    );
  };

  const closeModal = () => {
    setSelectedCase(null);
    setEditCaseData(null);
    setModalMode(null);
  };

  const handleView = async (id) => {
    try {
      const response = await api.get(`/cases/${id}`);
      setSelectedCase(response.data);
      setModalMode('view');
    } catch (error) {
      console.error('Failed to load case details:', error);
      alert('Unable to load case details.');
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await api.get(`/cases/${id}`);
      setEditCaseData(response.data);
      setModalMode('edit');
    } catch (error) {
      console.error('Failed to load case details:', error);
      alert('Unable to load case details.');
    }
  };

  const handleEditChange = (field, value) => {
    setEditCaseData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editCaseData) return;
    setSavingEdit(true);
    try {
      const payload = {
        title: editCaseData.title,
        description: editCaseData.description,
        recommendation: editCaseData.recommendation,
        status: editCaseData.status,
        department_id: editCaseData.department_id,
        employee_id: editCaseData.employee_id
      };
      const response = await api.put(`/cases/${editCaseData.id}`, payload);
      setCases((prev) => prev.map((item) => (item.id === response.data.id ? {
        ...item,
        title: response.data.title,
        status: response.data.status
      } : item)));
      closeModal();
    } catch (error) {
      console.error('Failed to update case:', error);
      alert('Unable to save case changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Case assignment</h1>
          <p className="text-muted">Review all cases and route work to the right responder team.</p>
        </div>
        <Link to="/cases/new">
          <button className="primary" type="button">Create case</button>
        </Link>
      </div>

      <div className="panel table-wrapper">
        {loading ? (
          <p>Loading case records…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Department</th>
                <th>Responder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id}>
                  <td>{item.case_reference}</td>
                  <td>{item.title}</td>
                  <td>{renderStatus(item.status)}</td>
                  <td>{item.department || 'Unassigned'}</td>
                  <td>{item.assigned_employee || 'Unassigned'}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="ghost icon-button" onClick={() => handleView(item.id)} type="button" aria-label="View case">👁️</button>
                    <button className="ghost icon-button" onClick={() => handleEdit(item.id)} type="button" aria-label="Edit case">✏️</button>
                    <button className="ghost icon-button" style={{ color: '#ef4444' }} onClick={() => handleDelete(item.id)} type="button" aria-label="Delete case">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modalMode === 'view' || modalMode === 'edit') && (selectedCase || editCaseData) && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'view' ? 'Case details' : 'Edit case'}</h3>
              <button className="ghost icon-button" type="button" onClick={closeModal} aria-label="Close modal">×</button>
            </div>

            {modalMode === 'view' ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div className="detail-row">
                  <div className="detail-label">Case ID</div>
                  <div className="detail-value">{selectedCase.case_reference}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Title</div>
                  <div className="detail-value">{selectedCase.title}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">{selectedCase.status}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Department</div>
                  <div className="detail-value">{selectedCase.department || 'Unassigned'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Assigned employee</div>
                  <div className="detail-value">{selectedCase.assigned_employee || 'Unassigned'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Description</div>
                  <div className="detail-value">{selectedCase.description || 'No description provided.'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Recommendation</div>
                  <div className="detail-value">{selectedCase.recommendation || 'No recommendation provided.'}</div>
                </div>
              </div>
            ) : (
              <form className="grid-gap" onSubmit={handleSaveEdit}>
                <label>
                  Case title
                  <input value={editCaseData.title} onChange={(e) => handleEditChange('title', e.target.value)} type="text" />
                </label>
                <label>
                  Status
                  <select value={editCaseData.status} onChange={(e) => handleEditChange('status', e.target.value)}>
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>
                <label>
                  Description
                  <textarea value={editCaseData.description} onChange={(e) => handleEditChange('description', e.target.value)} rows="4" />
                </label>
                <label>
                  Recommendation
                  <textarea value={editCaseData.recommendation} onChange={(e) => handleEditChange('recommendation', e.target.value)} rows="3" />
                </label>
                <div className="button-row">
                  <button className="primary" type="submit" disabled={savingEdit}>{savingEdit ? 'Saving…' : 'Save changes'}</button>
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
