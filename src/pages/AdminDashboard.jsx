import React, { useState, useEffect } from 'react';
import { Users, Settings, Activity, CheckCircle, XCircle, ShieldAlert, Briefcase, Search, Plus, Trash2, Edit3, ShieldCheck, Database, HardDrive, RefreshCw } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import FlatButton from '../components/ui/FlatButton';
import { useAuth } from '../context/AuthContext';
import { Tabs } from '../components/ui/Tabs';
import { useAlert } from '../context/AlertContext';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  
  const fetchData = async () => {
    try {
      const jobsRes = await fetch('/api/jobs/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (jobsRes.ok) setJobs(await jobsRes.json());
      
      const usersRes = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const tabs = [
    { id: 'jobs', label: 'Job Approvals', content: <JobApprovalsTab jobs={jobs} token={token} onRefresh={fetchData} /> },
    { id: 'users', label: 'User Moderation', content: <UserModerationTab users={users} token={token} onRefresh={fetchData} /> },
    { id: 'resources', label: 'Publish Resources', content: <ResourcesManagementTab token={token} /> },
    { id: 'system', label: 'System Maintenance', content: <SystemMaintenanceTab token={token} /> },
  ];

  const pendingJobsCount = jobs.filter(j => j.status === 'pending_approval').length;
  const blockedUsersCount = users.filter(u => u.status === 'blocked').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><ShieldAlert className="text-red-500" /> Admin Command Center</h1>
        <p className="text-slate-600 dark:text-slate-400">Perform user moderation, approve corporate listings, publish guidance resources, and audit Redis caching.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="flex items-center gap-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Users size={28} /></div>
          <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{users.length}</h3><p className="text-xs text-slate-600 dark:text-slate-400">Total Users</p></div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 border-l-4 border-yellow-500">
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Briefcase size={28} /></div>
          <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{pendingJobsCount}</h3><p className="text-xs text-slate-600 dark:text-slate-400">Pending Job Approvals</p></div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 border-l-4 border-red-500">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><ShieldAlert size={28} /></div>
          <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{blockedUsersCount}</h3><p className="text-xs text-slate-600 dark:text-slate-400">Blocked Profiles</p></div>
        </GlassCard>
      </div>

      <Tabs tabs={tabs} defaultTab="jobs" />
    </div>
  );
};

const JobApprovalsTab = ({ jobs, token, onRefresh }) => {
  const pendingJobs = jobs.filter(j => j.status === 'pending_approval');
  
  const handleUpdateStatus = async (jobId, status) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Job status updated to: ${status}`);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (pendingJobs.length === 0) {
    return <GlassCard className="text-center py-12"><p className="text-slate-600 dark:text-slate-400 text-xs italic">No job listings awaiting approval. Excellent!</p></GlassCard>;
  }

  return (
    <div className="space-y-4">
      {pendingJobs.map(job => (
        <GlassCard key={job.id} className="flex flex-col md:flex-row justify-between gap-4 border border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h4>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mt-2">
              <p><span className="text-slate-500 dark:text-slate-500">Company:</span> {job.company}</p>
              <p><span className="text-slate-500 dark:text-slate-500">Location:</span> {job.location}</p>
              <p><span className="text-slate-500 dark:text-slate-500">Compensation:</span> {job.salary}</p>
              {job.description && <p className="bg-slate-50 dark:bg-black/30 p-2.5 rounded-lg border border-slate-200 dark:border-white/5 mt-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">{job.description}</p>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {job.tags && job.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-black/40 text-[9px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 font-mono">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FlatButton onClick={() => handleUpdateStatus(job.id, 'rejected')} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs py-1 px-3">
              <XCircle size={14} className="mr-1 inline" /> Reject
            </FlatButton>
            <FlatButton onClick={() => handleUpdateStatus(job.id, 'active')} variant="primary" className="bg-[#10b981] hover:bg-[#059669] text-slate-900 dark:text-white text-xs py-1 px-3 font-bold">
              <CheckCircle size={14} className="mr-1 inline" /> Approve Job
            </FlatButton>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

const UserModerationTab = ({ users, token, onRefresh }) => {
  // Query Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const { showAlert, showConfirm } = useAlert();

  // Clear selection if users data updates or filters change
  useEffect(() => {
    setSelectedUserIds([]);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    showConfirm(`Are you sure you want to change user status to: ${newStatus}?`, async () => {
        try {
          const res = await fetch(`/api/users/${userId}/status`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
            onRefresh();
          }
        } catch (err) {
          console.error(err);
        }
    });
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedUserIds.length === 0) return;
    
    showConfirm(`Change status to '${newStatus}' for ${selectedUserIds.length} users?`, async () => {
      try {
        const res = await fetch('/api/users/bulk/status', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ userIds: selectedUserIds, status: newStatus })
        });
        if (res.ok) {
          showAlert(`Successfully updated status of ${selectedUserIds.length} users to ${newStatus}.`, 'success');
          setSelectedUserIds([]);
          onRefresh();
        } else {
          const errorData = await res.json();
          showAlert(`Error: ${errorData.error || 'Failed to update'}`, 'error');
        }
      } catch (err) {
        console.error(err);
        showAlert('Internal Server Error. Check server console.', 'error');
      }
    });
  };

  // Live filtering
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filter blockable users (cannot block Admins)
  const blockableUsers = filteredUsers.filter(u => u.role !== 'ADMIN');

  const handleSelectUser = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const blockableIds = blockableUsers.map(u => u.id);
    const allSelected = blockableIds.every(id => selectedUserIds.includes(id));
    
    if (allSelected) {
      setSelectedUserIds(prev => prev.filter(id => !blockableIds.includes(id)));
    } else {
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...blockableIds])));
    }
  };

  // Extract unique criteria for selector tools
  const uniqueGraduationYears = Array.from(new Set(
    blockableUsers.map(u => u.Profile?.graduation_year).filter(Boolean)
  )).sort((a, b) => b - a);

  const uniqueEmailDomains = Array.from(new Set(
    blockableUsers.map(u => u.email.split('@')[1]).filter(Boolean)
  )).sort();

  const selectByCriteria = (type, value) => {
    if (!value) return;
    let targets = [];
    
    if (type === 'class') {
      targets = blockableUsers.filter(u => u.Profile?.graduation_year === parseInt(value));
    } else if (type === 'domain') {
      targets = blockableUsers.filter(u => u.email.endsWith(`@${value}`));
    } else if (type === 'role') {
      targets = blockableUsers.filter(u => u.role === value);
    }

    const targetIds = targets.map(u => u.id);
    setSelectedUserIds(prev => Array.from(new Set([...prev, ...targetIds])));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Search, Filtration, and Selection Criteria panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dynamic Filters */}
        <div className="lg:col-span-2">
          <GlassCard className="p-4 h-full flex flex-col justify-center">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search user name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 rounded-lg p-2 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="INTERVIEWER">INTERVIEWER</option>
                  <option value="STUDENT">STUDENT</option>
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 rounded-lg p-2 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Selection Assistant */}
        <div className="lg:col-span-1">
          <GlassCard className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 h-full">
            <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-[#0ea5e9] mb-3 flex items-center gap-1.5">
              <Settings size={13} className="text-[#0ea5e9]" /> Bulk Select Assistant
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <select
                onChange={(e) => {
                  selectByCriteria('class', e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 text-[10px] text-slate-700 dark:text-slate-300 rounded-lg p-1.5 focus:outline-none cursor-pointer w-full text-center"
              >
                <option value="" disabled>By Class</option>
                {uniqueGraduationYears.map(yr => (
                  <option key={yr} value={yr}>Class of {yr}</option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  selectByCriteria('domain', e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 text-[10px] text-slate-700 dark:text-slate-300 rounded-lg p-1.5 focus:outline-none cursor-pointer w-full text-center"
              >
                <option value="" disabled>By Domain</option>
                {uniqueEmailDomains.map(dom => (
                  <option key={dom} value={dom}>@{dom}</option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  selectByCriteria('role', e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 text-[10px] text-slate-700 dark:text-slate-300 rounded-lg p-1.5 focus:outline-none cursor-pointer w-full text-center"
              >
                <option value="" disabled>By Role</option>
                <option value="STUDENT">STUDENT</option>
                <option value="INTERVIEWER">INTERVIEWER</option>
              </select>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Floating Bulk Actions bar */}
      {selectedUserIds.length > 0 && (
        <div className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 bg-[#0ea5e9] text-slate-900 dark:text-white text-[11px] font-bold rounded-full flex items-center justify-center font-mono">
              {selectedUserIds.length}
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
              users selected for bulk administration
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setSelectedUserIds([])}
              className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white px-3 py-1.5 border border-slate-300 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:bg-white/5 transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
            <button
              onClick={() => handleBulkStatusChange('active')}
              className="text-[10px] uppercase font-bold bg-[#10b981] hover:bg-[#059669] text-slate-900 dark:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={12} /> Bulk Unblock
            </button>
            <button
              onClick={() => handleBulkStatusChange('blocked')}
              className="text-[10px] uppercase font-bold bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert size={12} /> Bulk Block
            </button>
          </div>
        </div>
      )}

      {/* Main Table Repository */}
      <GlassCard className="overflow-hidden p-0 border border-slate-200 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-black/30 text-[10px] uppercase font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={blockableUsers.length > 0 && blockableUsers.every(u => selectedUserIds.includes(u.id))}
                    onChange={handleSelectAll}
                    className="h-3.5 w-3.5 accent-[#0ea5e9] bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded focus:ring-0 focus:outline-none cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Name & Email</th>
                <th className="px-6 py-4">Role Tag</th>
                <th className="px-6 py-4">Platform Status</th>
                <th className="px-6 py-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? filteredUsers.map(user => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <tr 
                    key={user.id} 
                    className={`transition-colors duration-150 ${
                      isSelected 
                        ? 'bg-[#0ea5e9]/5 hover:bg-[#0ea5e9]/10 border-l-2 border-[#0ea5e9]' 
                        : 'hover:bg-slate-50 dark:bg-white/5'
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      {user.role !== 'ADMIN' ? (
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectUser(user.id)}
                          className="h-3.5 w-3.5 accent-[#0ea5e9] bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded focus:ring-0 focus:outline-none cursor-pointer"
                        />
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{user.name}</div>
                        {user.Profile?.graduation_year && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                            Class of {user.Profile.graduation_year}
                          </span>
                        )}
                        {user.Profile?.course && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-black/40 text-[#0ea5e9] border border-[#0ea5e9]/20 truncate max-w-[120px]">
                            {user.Profile.course}
                          </span>
                        )}
                        {user.Profile?.university && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 truncate max-w-[150px]">
                            {user.Profile.university}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-500 mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/10' :
                        user.role === 'INTERVIEWER' ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/10' :
                        'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/10'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active === false || user.status === 'blocked' ? (
                        <span className="flex items-center gap-1 text-red-500 font-bold"><ShieldAlert size={12} /> Blocked</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#10b981] font-bold"><CheckCircle size={12} /> Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.is_active ? 'active' : 'blocked')}
                          className={`text-[10px] font-bold hover:underline cursor-pointer ${user.is_active ? 'text-red-400 font-bold' : 'text-[#10b981] font-bold'}`}
                        >
                          {user.is_active ? 'Restrict Profile' : 'Restore Profile'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 dark:text-slate-500 italic">No matching user records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

// Publisher resources CRUD panel
const ResourcesManagementTab = ({ token }) => {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'career_guidance' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const { showAlert, showConfirm } = useAlert();

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setResources(await res.json());
    } catch (err) {
      console.error(err);
      showAlert('Failed to fetch resources', 'error');
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/resources/${editingId}` : '/api/resources';
      const method = editingId ? 'PUT' : 'POST';

      let body;
      let headers = {
        'Authorization': `Bearer ${token}`
      };

      if (!editingId) {
        body = new FormData();
        body.append('title', formData.title);
        body.append('content', formData.content);
        body.append('type', formData.type);
        if (selectedFile) {
          body.append('file', selectedFile);
        }
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(formData);
      }

      const res = await fetch(url, {
        method,
        headers,
        body
      });

      if (res.ok) {
        setFormData({ title: '', content: '', type: 'career_guidance' });
        setSelectedFile(null);
        if (document.getElementById('resourceFile')) document.getElementById('resourceFile').value = '';
        setEditingId(null);
        fetchResources();
        showAlert('Resource successfully saved.', 'success');
      } else {
        showAlert('Failed to save resource.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error connecting to server.', 'error');
    }
  };

  const handleEdit = (res) => {
    setEditingId(res.id);
    setFormData({ title: res.title, content: res.content, type: res.type });
  };

  const handleDelete = (id) => {
    showConfirm('Delete this resource permanently?', async () => {
      try {
        const res = await fetch(`/api/resources/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchResources();
          showAlert('Resource deleted.', 'success');
        } else {
          showAlert('Failed to delete resource.', 'error');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error connecting to server.', 'error');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Resource Publisher Form */}
      <div className="lg:col-span-1">
        <GlassCard className="border-t-2 border-[#10b981]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
            <Plus size={16} className="text-[#10b981]" /> {editingId ? 'Edit Material' : 'Publish Guidance / Prep'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">Resource Title</label>
              <input required type="text" placeholder="e.g. Master React Hooks" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded p-2 text-xs text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">Content Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded p-2 text-xs text-slate-600 dark:text-slate-400 focus:outline-none">
                <option value="career_guidance">Career Guidance Path</option>
                <option value="interview_prep">Interview Preparation Tool</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">Body Material Content</label>
              <textarea required={!selectedFile && !editingId} rows={4} placeholder="Detailed text resources, advice guidelines..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded p-2 text-xs text-slate-800 dark:text-slate-200 resize-none leading-relaxed" />
            </div>

            {!editingId && (
              <div>
                <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">Attach File (Optional PDF/DOCX)</label>
                <input id="resourceFile" type="file" onChange={e => setSelectedFile(e.target.files[0])} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded p-2 text-xs text-slate-600 dark:text-slate-400 focus:outline-none" />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({title:'', content:'', type:'career_guidance'}); }} className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white px-2">Cancel</button>}
              <FlatButton type="submit" variant="primary" className="bg-[#10b981] text-xs py-1 px-4 font-bold text-slate-900 dark:text-white">
                {editingId ? 'Save' : 'Publish'}
              </FlatButton>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Published Resources List */}
      <div className="lg:col-span-2">
        <GlassCard className="min-h-[400px]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5"><Database size={16} className="text-[#8b5cf6]" /> Active Repository Content ({resources.length})</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {resources.length > 0 ? resources.map(r => (
              <div key={r.id} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:border-slate-300 dark:border-white/10 transition-all flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</h4>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold mt-1 inline-block uppercase border ${
                    r.type === 'interview_prep' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20' : 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20'
                  }`}>
                    {r.type.replace('_', ' ')}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-2 line-clamp-3">{r.content}</p>
                  {r.file_url && (
                    <a href={`${r.file_url}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#10b981] hover:underline mt-2 inline-block font-bold">
                      View Attached File
                    </a>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(r)} className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] p-1 transition-colors"><Edit3 size={13} /></button>
                  <button onClick={() => handleDelete(r.id)} className="text-slate-600 dark:text-slate-400 hover:text-red-400 p-1 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 dark:text-slate-500 text-xs italic text-center py-16">No guidance resources published.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// System maintenance, simulated cache Hit & CPU diagnostics panel
const SystemMaintenanceTab = ({ token }) => {
  const [metrics, setMetrics] = useState(null);
  const [dbReport, setDbReport] = useState(null);
  const [cacheResult, setCacheResult] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMetrics(await res.json());
      }
      setLoadingMetrics(false);
    } catch (err) {
      console.error(err);
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const runDbCheck = async () => {
    try {
      const res = await fetch('/api/admin/db-check', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const report = await res.json();
        setDbReport(report);
        alert('Database integrity scan complete.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const flushCache = async () => {
    try {
      const res = await fetch('/api/admin/clear-cache', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setCacheResult(result);
        fetchMetrics();
        alert(`Redis performance cache flushed. ${result.keys_cleared || 0} keys cleared.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingMetrics) return <p className="text-slate-600 dark:text-slate-400 text-xs italic">Connecting live diagnostic hooks...</p>;

  return (
    <div className="space-y-6">
      {/* Diagnostic Gauges & Charts */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Gauge Heap Usage */}
          <GlassCard className="relative overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5"><HardDrive size={14} className="text-[#8b5cf6]" /> Server RAM Analytics</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Node.js Heap Memory</span>
                <span className="text-slate-900 dark:text-white font-mono">{metrics.system_health.heap_used_mb}MB / {metrics.system_health.heap_total_mb}MB</span>
              </div>
              <div className="h-2 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] rounded-full" 
                  style={{ width: `${Math.round((metrics.system_health.heap_used_mb / metrics.system_health.heap_total_mb) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">Heap size measured from current active Node cluster process.</p>
            </div>
          </GlassCard>

          {/* Health Gauge CPU */}
          <GlassCard className="relative overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5"><Activity size={14} className="text-[#10b981]" /> Simulated CPU Load</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Active Core Threads</span>
                <span className="text-slate-900 dark:text-white font-mono">{metrics.system_health.cpu_load_percent}% Load</span>
              </div>
              <div className="h-2 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                <div 
                  className="h-full bg-[#10b981] rounded-full" 
                  style={{ width: `${metrics.system_health.cpu_load_percent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">Platform cluster: {metrics.system_health.platform} with {metrics.system_health.node_version}</p>
            </div>
          </GlassCard>

          {/* Redis Cache Hit Ratio */}
          <GlassCard className="relative overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5"><Settings size={14} className="text-[#0ea5e9]" /> Redis Cache Diagnostic</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Cache Hit Rate</span>
                <span className="text-[#10b981] font-extrabold">{metrics.cache_metrics.hit_ratio}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 pt-1">
                <span>Hits: {metrics.cache_metrics.hits}</span>
                <span>Misses: {metrics.cache_metrics.misses}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">Uptime: {metrics.cache_metrics.uptime_seconds}s • Status: {metrics.cache_metrics.status}</p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Action triggers */}
      <GlassCard>
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Command Actions & Utilities</h4>
        <div className="flex flex-wrap gap-3">
          <FlatButton onClick={runDbCheck} variant="outline" className="border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white flex items-center gap-2 text-xs py-1.5 px-4 font-bold">
            <Database size={14} /> Run DB Consistency Check
          </FlatButton>
          <FlatButton onClick={flushCache} variant="primary" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-slate-900 dark:text-white flex items-center gap-2 text-xs py-1.5 px-4 font-bold">
            <RefreshCw size={14} /> Flush Redis cache
          </FlatButton>
        </div>

        {/* Flush cache results details logs */}
        {cacheResult && (
          <div className="mt-4 p-3 bg-slate-100 dark:bg-black/40 rounded-lg border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
            <div className="text-[#10b981] font-bold mb-1">√ CACHE_FLUSH_SUCCESSFUL</div>
            <div>Keys Cleared: {cacheResult.keys_cleared}</div>
            <div>Execution Speed: {cacheResult.execution_time_ms}ms</div>
            <div>Uptime Latency Recovery: {metrics.cache_metrics.latency_with_cache_ms}ms (Flushed preheat timeout: {metrics.cache_metrics.latency_without_cache_ms}ms)</div>
          </div>
        )}

        {/* DB Consistency check results details logs */}
        {dbReport && (
          <div className="mt-4 p-3 bg-slate-100 dark:bg-black/40 rounded-lg border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
            <div className="text-[#0ea5e9] font-bold mb-1">√ DATABASE_INTEGRITY_SCAN_REPORT</div>
            <div>Status: <span className={dbReport.status === 'healthy' ? 'text-[#10b981]' : 'text-yellow-500'}>{dbReport.status.toUpperCase()}</span></div>
            <div>Records checked: {dbReport.total_records_checked}</div>
            {dbReport.orphan_records.length > 0 ? (
              <div className="mt-2 text-yellow-500 space-y-1">
                <div>Orphan Records Found: {dbReport.orphan_records.length}</div>
                {dbReport.orphan_records.map((r, i) => (
                  <div key={i} className="pl-2 border-l border-yellow-500/30 text-[10px]">• [{r.type}] {r.detail}</div>
                ))}
              </div>
            ) : (
              <div className="text-[#10b981] mt-2 font-bold flex items-center gap-1"><ShieldCheck size={14} /> DB consistency verification complete. Zero orphan records detected.</div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminDashboard;
