import { useEffect, useState } from 'react';
import api from '../services/api.js';

function StatCard({ title, value, color }) {
  return (
    <div className="panel" style={{ borderLeft: `4px solid ${color}` }}>
      <p className="heading-sm text-muted">{title}</p>
      <p className="text-large" style={{ marginTop: '14px', color }}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const response = await api.get('/dashboard/overview');
        setOverview(response.data);
      } catch (error) {
        console.error('Dashboard load failed', error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Live case overview</h1>
          <p className="text-muted">Your incident, department, and responder metrics in one place.</p>
        </div>
      </div>

      {loading && <div className="panel">Loading dashboard metrics…</div>}

      {!loading && overview && (
        <div className="grid-gap" style={{ marginBottom: '24px' }}>
          <div className="card-grid">
            <StatCard title="Total cases" value={overview.totals.total_cases} color="#3b82f6" />
            <StatCard title="Departments" value={overview.totals.total_departments} color="#f97316" />
            <StatCard title="Employees" value={overview.totals.total_employees} color="#10b981" />
            <StatCard title="Roles" value={overview.totals.total_roles} color="#8b5cf6" />
          </div>
        </div>
      )}

      {overview && (
        <div className="grid-gap">
          <div className="panel">
            <div className="page-header">
              <div>
                <h2 className="heading-sm">Cases by department</h2>
                <p className="text-muted">Review workload across each department.</p>
              </div>
            </div>
            <div className="grid-gap">
              {overview.casesByDepartment.map((item, idx) => (
                <div key={item.department} style={{ gap: '8px', display: 'grid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span>{item.department || 'Unassigned'}</span>
                    <span>{item.case_count}</span>
                  </div>
                  <div className="chart-bar">
                    <span style={{ width: `${Math.min(100, item.case_count * 10)}%`, background: ['linear-gradient(90deg,#3b82f6,#60a5fa)', 'linear-gradient(90deg,#f97316,#fb923c)', 'linear-gradient(90deg,#10b981,#06b6d4)'][idx % 3] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="page-header">
              <div>
                <h2 className="heading-sm">Cases by responder</h2>
                <p className="text-muted">Track assignment pressure across employees.</p>
              </div>
            </div>
            <div className="grid-gap">
              {overview.casesByEmployee.map((item, idx) => (
                <div key={item.employee} style={{ gap: '8px', display: 'grid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span>{item.employee || 'Unassigned'}</span>
                    <span>{item.case_count}</span>
                  </div>
                  <div className="chart-bar">
                    <span style={{ width: `${Math.min(100, item.case_count * 10)}%`, background: ['linear-gradient(90deg,#8b5cf6,#7c3aed)', 'linear-gradient(90deg,#ef4444,#f97316)', 'linear-gradient(90deg,#06b6d4,#06b6d4)'][idx % 3] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
