"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Observe theme changes for conditional styling
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    Promise.all([
      fetch('/api/dashboard').then(res => res.json()),
      fetch('/api/tasks').then(res => res.json()),
      fetch('/api/volunteers').then(res => res.json())
    ]).then(([dashboardData, taskData, volunteerData]) => {
      setStats(dashboardData);
      setTasks(taskData);
      setVolunteers(volunteerData);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
      <div className="gradient-text" style={{fontSize: '24px', animation: 'pulse 2s infinite'}}>Loading Insights...</div>
    </div>
  );

  const totalTasks = Object.values(stats?.tasksByUrgency || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="gradient-text">Global Overview</h1>
          <p style={{color: 'var(--text-secondary)', marginTop: '8px'}}>AI-powered resource insights and telemetry.</p>
        </div>
        <Link href="/tasks/new" className="btn btn-primary">
          <span>+</span> Create Task
        </Link>
      </header>

      <div className="stats-grid animate-fade-in delay-1">
        <div className="glass-panel stat-card critical">
          <div className="stat-title">Critical Attention Needed</div>
          <div className="stat-value" style={{color: 'var(--accent-red)'}}>
            {stats.criticalTasks} <span>tasks</span>
          </div>
          <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px'}}>Priority scores &gt;80</p>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-title">Active Field Tasks</div>
          <div className="stat-value" style={{color: 'var(--accent-blue)'}}>
            {stats.activeTasks}
          </div>
        </div>

        <div className="glass-panel stat-card success">
          <div className="stat-title">Available Volunteers</div>
          <div className="stat-value" style={{color: 'var(--accent-green)'}}>
            {stats.totalVolunteers}
          </div>
        </div>
      </div>

      <div className="stats-grid animate-fade-in delay-2" style={{gridTemplateColumns: '1fr 1fr'}}>
        <div className="glass-panel" style={{maxHeight: '400px', overflowY: 'auto'}}>
          <h3 style={{marginBottom: '24px', fontSize: '18px'}}>Active Tasks Overview</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {(tasks || []).map(task => {
              const assignedVols = (volunteers || []).filter(v => v.assignedTaskId === task.id);
              return (
                <div key={task.id} style={{padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                    <div style={{fontWeight: '600'}}>{task.title}</div>
                    <div className={`badge ${task.status === 'Completed' ? 'badge-low' : task.status === 'In Progress' ? 'badge-medium' : 'badge-pending'}`} style={{fontSize: '11px'}}>
                      {task.status}
                    </div>
                  </div>
                  <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
                    <div style={{marginBottom: '4px'}}>
                      <strong>Assigned Volunteers:</strong> {assignedVols.length}
                    </div>
                    {assignedVols.length > 0 ? (
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                        {(assignedVols || []).map(v => (
                          <span key={v.id} style={{background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px'}}>
                            {v.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{fontStyle: 'italic', color: isDark ? 'rgba(255,255,255,0.3)' : '#1f2937'}}>No volunteers assigned</div>
                    )}
                  </div>
                </div>
              );
            })}
            {(tasks || []).length === 0 && (
              <div style={{color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px'}}>No tasks available</div>
            )}
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{marginBottom: '24px', fontSize: '18px'}}>Task Requirements by Category</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {Object.entries(stats.taskCategories || {}).map(([cat, count]) => (
              <div key={cat} style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <div style={{width: '100px', fontSize: '14px', color: 'var(--text-secondary)'}}>{cat}</div>
                <div style={{flex: 1, background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                  <div style={{height: '100%', width: `${(count / totalTasks) * 100}%`, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))', borderRadius: '4px'}}></div>
                </div>
                <div style={{width: '40px', textAlign: 'right', fontWeight: 'bold'}}>{count}</div>
              </div>
            ))}
            {Object.keys(stats.taskCategories || {}).length === 0 && (
              <div style={{color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '40px'}}>No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
