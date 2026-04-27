"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  const deleteTask = async (id) => {
    if (window.confirm("Are you sure you want to remove this task?")) {
      try {
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setTasks(tasks.filter(t => t.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'In Progress': return 'badge-high';
      case 'Completed': return 'badge-low';
      default: return 'badge-pending';
    }
  };

  const getPriorityLabel = (score) => {
    if (score <= 70) return "Low";
    if (score <= 140) return "Medium";
    if (score <= 150) return "High";
    return "Critical";
  };

  return (
    <div className="animate-fade-in bg-transparent">
      <header className="page-header">
        <div>
          <h1 className="gradient-text">Task Management</h1>
          <p style={{color: 'var(--text-secondary)', marginTop: '8px'}}>View and manage community needs and field operations.</p>
        </div>
        <Link href="/tasks/new" className="btn btn-primary">
          <span>+</span> Create Task
        </Link>
      </header>

      <div className="glass-panel animate-fade-in delay-1 border-none bg-transparent" style={{padding: '0', overflow: 'hidden'}}>
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)'}}>No tasks available. Create one to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title & Location</th>
                <th>Category</th>
                <th>Priority Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(tasks || []).map((task) => (
                <tr key={task.id} className="shadow-sm border-none">
                  <td>
                    <div style={{fontWeight: '600', marginBottom: '4px'}}>{task.title}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{task.location} • {task.affectedCount} affected</div>
                  </td>
                  <td>{task.category}</td>
                  <td>
                    <div>
                      <span className={
                        task.priority <= 70 ? "text-green-600" :
                        task.priority <= 140 ? "text-yellow-600" :
                        task.priority <= 150 ? "text-orange-600" :
                        "text-red-600 font-semibold"
                      }>
                        {getPriorityLabel(task.priority)}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({task.priority})
                      </span>
                    </div>
                  </td>
                  <td>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className={`badge ${getStatusBadgeClass(task.status)} bg-gray-100 dark:bg-[#1f2937] text-black dark:text-white border-none outline-none focus:outline-none`}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <div className="flex gap-3 items-center">
                      {task.status !== 'Assigned' && (
                        <Link href={`/tasks/${task.id}/assign`} className="btn btn-primary" style={{padding: '6px 12px', fontSize: '13px'}}>
                          Smart Match ✨
                        </Link>
                      )}
                      <button 
                        className="btn btn-secondary" 
                        style={{padding: '6px 12px', fontSize: '13px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)'}}
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
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
