"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editAddress, setEditAddress] = useState("");

  const startEditing = (vol) => {
    setEditingId(vol.id);
    setEditAddress(vol.location);
  };

  const saveAddress = async (id) => {
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: editAddress }),
      });
      if (res.ok) {
        setVolunteers(volunteers.map(v => v.id === id ? { ...v, location: editAddress } : v));
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to update volunteer address", error);
    }
  };

  useEffect(() => {
    fetch('/api/volunteers')
      .then(res => res.json())
      .then(data => {
        setVolunteers(data);
        setLoading(false);
      });
  }, []);

  const deleteVolunteer = async (id) => {
    if (window.confirm("Are you sure you want to remove this volunteer?")) {
      try {
        const res = await fetch(`/api/volunteers/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setVolunteers(volunteers.filter(vol => vol.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete volunteer", error);
      }
    }
  };

  return (
    <div className="animate-fade-in bg-transparent">
      <header className="page-header">
        <div>
          <h1 className="gradient-text">Volunteer Network</h1>
          <p style={{color: 'var(--text-secondary)', marginTop: '8px'}}>Manage community members, skills, and availability.</p>
        </div>
        <Link href="/volunteers/new" className="btn btn-primary">
          <span>+</span> Add Volunteer
        </Link>
      </header>

      <div className="glass-panel animate-fade-in delay-1 border-none bg-transparent" style={{padding: '0', overflow: 'hidden'}}>
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading personnel...</div>
        ) : volunteers.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)'}}>No volunteers registered yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Primary Skill</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((vol) => {
                const isAssigned = vol.assignedTaskId || vol.assignedTask;
                const taskName = vol.assignedTask?.title || (typeof vol.assignedTask === 'string' ? vol.assignedTask : null) || `Task #${vol.assignedTaskId}`;

                return (
                <tr key={vol.id} className="shadow-sm border-none">
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff'}}>
                        {vol.name.charAt(0)}
                      </div>
                      <div style={{fontWeight: '600'}}>{vol.name}</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-medium" style={{background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)'}}>{vol.skill}</span>
                    <p style={{fontSize: '12px', marginTop: '6px', color: 'var(--text-secondary)', margin: 0, paddingTop: '6px'}}>
                      Secondary Skills: {
                        vol.secondarySkills && vol.secondarySkills.length > 0
                          ? vol.secondarySkills.join(", ")
                          : "None"
                      }
                    </p>
                  </td>
                  <td>
                    {editingId === vol.id ? (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px'}}>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="px-2 py-1 rounded w-full bg-gray-100 dark:bg-[#1f2937] text-black dark:text-white border-none outline-none focus:outline-none text-sm"
                        />
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button onClick={() => saveAddress(vol.id)} className="btn btn-primary" style={{padding: '4px 8px', fontSize: '12px'}}>Save</button>
                          <button onClick={() => setEditingId(null)} className="btn btn-secondary" style={{padding: '4px 8px', fontSize: '12px'}}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      vol.location
                    )}
                  </td>
                  <td>
                    {vol.isAvailable ? (
                      <span className="badge badge-low">Available</span>
                    ) : (
                      <span className="badge badge-critical">Deployed / Unavailable</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-3 items-center">
                      <button 
                        className="btn btn-secondary" 
                        style={{padding: '6px 12px', fontSize: '13px'}}
                        onClick={() => startEditing(vol)}
                      >
                        Edit Details
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{padding: '6px 12px', fontSize: '13px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)'}}
                        onClick={() => deleteVolunteer(vol.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
