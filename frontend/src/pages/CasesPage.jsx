import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

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
                  <td>{item.department || 'Unassigned'}</td>
                  <td>{item.assigned_employee || 'Unassigned'}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="ghost" style={{ padding: '6px 10px', fontSize: '0.85rem' }} type="button">View</button>
                    <button className="ghost" style={{ padding: '6px 10px', fontSize: '0.85rem' }} type="button">Edit</button>
                    <button className="ghost" style={{ padding: '6px 10px', fontSize: '0.85rem', color: '#ef4444' }} onClick={() => handleDelete(item.id)} type="button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
