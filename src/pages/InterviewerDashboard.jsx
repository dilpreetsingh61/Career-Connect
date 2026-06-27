import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, Briefcase, Users, Plus, CheckCircle, XCircle, FileText, Download, User, Star, Trash2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import FlatButton from '../components/ui/FlatButton';
import { useAuth } from '../context/AuthContext';
import { Tabs } from '../components/ui/Tabs';
import { useAlert } from '../context/AlertContext';

const InterviewerDashboard = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setJobs(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJobs();
  }, [token]);

  const tabs = [
    { id: 'jobs', label: 'My Jobs & Applicants', content: <JobsListTab token={token} /> },
    { id: 'post', label: 'Post a Job', content: <PostJobTab token={token} onJobPosted={fetchJobs} /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Interviewer Hub</h1>
        <p className="text-slate-600 dark:text-slate-400">Post roles, evaluate resume matches, and schedule Google Meet interviews.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Briefcase size={28} /></div>
          <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{jobs.length}</h3><p className="text-xs text-slate-600 dark:text-slate-400">Total Postings</p></div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Clock size={28} /></div>
          <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{jobs.filter(j => j.status === 'pending_approval').length}</h3><p className="text-xs text-slate-600 dark:text-slate-400">Pending Approval</p></div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-[#10b981]/10 rounded-xl text-[#10b981]"><CheckCircle size={28} /></div>
          <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{jobs.filter(j => j.status === 'active').length}</h3><p className="text-xs text-slate-600 dark:text-slate-400">Active Listings</p></div>
        </GlassCard>
      </div>

      <Tabs tabs={tabs} defaultTab="jobs" />
    </div>
  );
};

const JobsListTab = ({ token }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [viewingResume, setViewingResume] = useState(null);
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/' + Math.random().toString(36).substring(2,12));
  const { showAlert } = useAlert();

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setJobs(await res.json());
    } catch (err) {
      console.error(err);
      showAlert('Failed to fetch jobs.', 'error');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const handleViewApplicants = async (jobId) => {
    setSelectedJobId(jobId);
    try {
      const res = await fetch(`/api/applications/job/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setApplicants(await res.json());
    } catch (err) {
      console.error(err);
      showAlert('Failed to fetch applicants.', 'error');
    }
  };

  const handleUpdateStatus = async (appId, status, additionalData = {}) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status, ...additionalData })
      });
      if (res.ok) {
        handleViewApplicants(selectedJobId);
        setSchedulingApp(null);
        setInterviewDate('');
        setMeetLink('https://meet.google.com/' + Math.random().toString(36).substring(2,12));
        showAlert(`Application status updated to ${status.replace('_', ' ')}.`, 'success');
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Update status failed:', errData);
        showAlert(`Failed to update status. ${errData.error || ''}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error connecting to server.', 'error');
    }
  };

  const openScheduler = (app) => {
    setSchedulingApp(app);
  };

  const submitSchedule = () => {
    if (!interviewDate) return showAlert('Please select a valid date and time.', 'error');
    
    const parsedDate = new Date(interviewDate);
    if (isNaN(parsedDate.getTime())) {
      return showAlert('Invalid date selected. Please check the year.', 'error');
    }

    handleUpdateStatus(schedulingApp.id, 'interview_scheduled', { interview_date: interviewDate, meeting_link: meetLink });
    setSchedulingApp(null);
  };

  const handleEvaluateATS = async (appId) => {
    try {
      const res = await fetch(`/api/applications/${appId}/evaluate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        handleViewApplicants(selectedJobId);
        showAlert('ATS Evaluation completed and score updated.', 'success');
      } else {
        showAlert('Failed to evaluate with ATS.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error during ATS Evaluation.', 'error');
    }
  };

  const handleNextRound = async (app) => {
    const nextRound = (app.current_round || 0) + 1;
    const selectedJob = jobs.find(j => j.id === selectedJobId);
    if (selectedJob && nextRound > selectedJob.total_rounds) {
      await handleUpdateStatus(app.id, 'selected', { current_round: selectedJob.total_rounds });
    } else {
      await handleUpdateStatus(app.id, 'shortlisted', { current_round: nextRound });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {/* Left Column Job Selection */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Briefcase size={18} className="text-[#0ea5e9]" /> Jobs Posted</h3>
        {jobs.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-500 italic">No job openings created yet.</p>
        ) : jobs.map(job => (
          <GlassCard 
            key={job.id} 
            className={`cursor-pointer transition-all border ${selectedJobId === job.id ? 'border-[#0ea5e9] bg-[#0ea5e9]/10' : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:border-white/10 bg-white dark:bg-black/20'}`}
            onClick={() => handleViewApplicants(job.id)}
          >
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{job.title}</h4>
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-slate-600 dark:text-slate-400">{job.location} • <span className="text-[#0ea5e9] font-bold">{job.total_rounds || 1} Rounds</span></span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                job.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' : 
                job.status === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {job.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
      
      {/* Right Column Applicants Details */}
      <div className="lg:col-span-2">
        <GlassCard className="min-h-[500px]">
          {selectedJobId ? (
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={18} className="text-[#8b5cf6]" /> Candidates Matched ({applicants.length})
              </h3>
              <div className="space-y-4">
                {applicants.length > 0 ? applicants.map(app => (
                  <div key={app.id} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:border-slate-300 dark:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{app.student?.name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{app.student?.email} • Round {app.current_round || 0} of {jobs.find(j => j.id === selectedJobId)?.total_rounds || 1}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-mono ${
                        app.status === 'selected' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' :
                        app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        app.status === 'interview_scheduled' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20' :
                        app.status === 'shortlisted' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20' :
                        'bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="mb-4 p-3 bg-slate-100 dark:bg-black/40 rounded-lg border border-slate-200 dark:border-white/5 flex items-center justify-between gap-4">
                      <div className="truncate">
                        <div className="text-xs text-slate-900 dark:text-white font-medium truncate flex items-center gap-1.5">
                          <FileText size={12} className="text-[#8b5cf6]" /> {app.Resume?.title || "Default Profile Resume"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-[#10b981] font-bold">Match Score: {app.Resume?.ai_score}%</span>
                        <button 
                          onClick={() => handleEvaluateATS(app.id)}
                          className="text-xs text-[#8b5cf6] hover:underline font-bold"
                        >
                          Run ATS Eval
                        </button>
                        <button 
                          onClick={() => setViewingResume(app.Resume)}
                          className="text-xs text-[#0ea5e9] hover:underline font-bold"
                        >
                          Open Reviewer
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-end">
                      {app.status !== 'rejected' && app.status !== 'selected' && (
                        <FlatButton onClick={() => handleUpdateStatus(app.id, 'rejected')} variant="outline" className="text-[10px] py-1 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10">
                          <XCircle size={12} className="mr-1 inline" /> Reject
                        </FlatButton>
                      )}
                      
                      {app.status === 'applied' && (
                        <FlatButton onClick={() => handleNextRound(app)} variant="primary" className="text-[10px] py-1 px-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-slate-900 dark:text-white">
                          <CheckCircle size={12} className="mr-1 inline" /> Pass Resume
                        </FlatButton>
                      )}
                      {app.status === 'shortlisted' && (
                        <>
                          <FlatButton onClick={() => openScheduler(app)} variant="primary" className="text-[10px] py-1 px-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-slate-900 dark:text-white">
                            <Calendar size={12} className="mr-1 inline" /> Schedule Round {app.current_round || 1}
                          </FlatButton>
                          <FlatButton onClick={() => handleNextRound(app)} variant="primary" className="text-[10px] py-1 px-3 bg-[#10b981] hover:bg-[#059669] text-slate-900 dark:text-white">
                            <CheckCircle size={12} className="mr-1 inline" /> Pass Without Interview
                          </FlatButton>
                        </>
                      )}
                      {app.status === 'interview_scheduled' && (
                        <FlatButton onClick={() => handleNextRound(app)} variant="primary" className="text-[10px] py-1 px-3 bg-[#10b981] hover:bg-[#059669] text-slate-900 dark:text-white">
                          <CheckCircle size={12} className="mr-1 inline" /> Mark Round Passed
                        </FlatButton>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-500 dark:text-slate-500 text-xs italic text-center py-16">No applicants have registered for this posting yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-500 py-24">
              <Users size={48} className="mb-4 opacity-30 text-[#8b5cf6]" />
              <p className="text-xs">Select a job posting from the list to manage and schedule candidates.</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* In-Built sliding resume parser panel drawer */}
      {viewingResume && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0f172a] border-l border-slate-300 dark:border-white/10 h-full p-6 shadow-2xl overflow-y-auto flex flex-col relative animate-in slide-in-from-right duration-300">
            <button 
              onClick={() => setViewingResume(null)}
              className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            >
              <XCircle size={22} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <User size={18} className="text-[#8b5cf6]" /> Candidate In-App Viewer
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 border-b border-slate-200 dark:border-white/5 pb-3">Scan resume details, scores, and tech keyword indicators on the fly.</p>

            <div className="space-y-6">
              {/* Circular Score representation */}
              <GlassCard className="text-center relative py-4 bg-[#8b5cf6]/5 border border-[#8b5cf6]/20">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{viewingResume.ai_score}%</div>
                <div className="text-[10px] text-[#10b981] font-bold mt-1">Verified Audit Score</div>
              </GlassCard>

              {/* Parsed Body Area & PDF Viewer */}
              <div>
                <h4 className="text-xs font-bold text-[#0ea5e9] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>Resume Source Content</span>
                  {viewingResume.file_url && viewingResume.file_url !== 'https://example.com/resume.pdf' && (
                    <a href={`${viewingResume.file_url}`} target="_blank" rel="noopener noreferrer" className="text-[#10b981] hover:underline normal-case">
                      (Download PDF)
                    </a>
                  )}
                </h4>
                
                {viewingResume.file_url && viewingResume.file_url.endsWith('.pdf') ? (
                  <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden h-96">
                    <iframe 
                      src={`${viewingResume.file_url}`} 
                      className="w-full h-full"
                      title="Resume PDF Viewer"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono max-h-48 overflow-y-auto">
                    {viewingResume.parsed_content || "No textual resume parsed information uploaded. File is clean PDF attachment format."}
                  </div>
                )}
              </div>

              {/* Extracted Details summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1"><Star size={12} className="text-yellow-500" /> Extracted Skill Indicators</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingResume.parsed_content ? 
                    ['react', 'javascript', 'typescript', 'node', 'express', 'sql', 'postgres', 'mongodb', 'docker', 'aws', 'git', 'figma']
                      .filter(skill => viewingResume.parsed_content.toLowerCase().includes(skill))
                      .map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20 text-[10px] text-[#10b981] capitalize font-bold">
                          {skill}
                        </span>
                      ))
                    : <span className="text-xs text-slate-500 dark:text-slate-500 italic">No skill tags extracted.</span>
                  }
                </div>
              </div>
            </div>

            <FlatButton 
              onClick={() => setViewingResume(null)}
              variant="outline"
              className="mt-auto border-slate-300 dark:border-white/10 text-xs w-full text-slate-900 dark:text-white"
            >
              Close Viewer
            </FlatButton>
          </div>
        </div>
      )}

      {/* Scheduling Interview Popup Modal */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 relative border-[#8b5cf6]/30">
            <button 
              onClick={() => setSchedulingApp(null)}
              className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            >
              <XCircle size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Calendar size={18} className="text-[#8b5cf6]" /> Schedule Discussion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium">Candidate: {schedulingApp.student?.name}</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">Select Date & Time</label>
                <input 
                  required
                  type="datetime-local" 
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">Auto-Generated Google Meet URL</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none"
                  />
                  <span className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg flex-shrink-0">
                    <Video size={16} />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <FlatButton 
                onClick={() => setSchedulingApp(null)}
                variant="outline"
                className="border-slate-300 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white"
              >
                Cancel
              </FlatButton>
              <FlatButton 
                onClick={submitSchedule}
                variant="primary"
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-slate-900 dark:text-white text-xs font-bold px-4"
              >
                Confirm Schedule
              </FlatButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

const PostJobTab = ({ token, onJobPosted }) => {
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'Full-time', salary: '', tags: '', description: '', jd_url: '', total_rounds: 1
  });
  const [roundTypes, setRoundTypes] = useState(['']);
  const [selectedJdFile, setSelectedJdFile] = useState(null);
  const { showAlert } = useAlert();

  const handleRoundsChange = (e) => {
    const rounds = parseInt(e.target.value) || 1;
    setFormData({...formData, total_rounds: rounds});
    setRoundTypes(prev => {
      const newTypes = [...prev];
      if (rounds > prev.length) {
        for (let i = prev.length; i < rounds; i++) newTypes.push('');
      } else if (rounds < prev.length) {
        newTypes.splice(rounds);
      }
      return newTypes;
    });
  };

  const handleRoundTypeChange = (index, value) => {
    const newTypes = [...roundTypes];
    newTypes[index] = value;
    setRoundTypes(newTypes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      const body = new FormData();
      body.append('title', formData.title);
      body.append('company', formData.company);
      body.append('location', formData.location);
      body.append('type', formData.type);
      body.append('salary', formData.salary);
      body.append('tags', JSON.stringify(tagsArray));
      body.append('description', formData.description);
      body.append('jd_url', formData.jd_url);
      body.append('total_rounds', formData.total_rounds);
      body.append('round_types', JSON.stringify(roundTypes.map(r => r || 'Unnamed Round')));
      
      if (selectedJdFile) {
        body.append('file', selectedJdFile);
      }

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: body
      });
      if (res.ok) {
        showAlert('Job posted successfully! Pending Admin Approval.', 'success');
        setFormData({ title: '', company: '', location: '', type: 'Full-time', salary: '', tags: '', description: '', jd_url: '', total_rounds: 1 });
        setRoundTypes(['']);
        setSelectedJdFile(null);
        if (document.getElementById('jdFile')) document.getElementById('jdFile').value = '';
        if (onJobPosted) onJobPosted();
      } else {
        const data = await res.json();
        showAlert(data.error || 'Failed to post job', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error connecting to server', 'error');
    }
  };

  return (
    <GlassCard className="max-w-2xl mx-auto border-t-2 border-[#10b981]">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Plus size={20} className="text-[#10b981]" /> Post a New Opening
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Job Title</label>
            <input required type="text" placeholder="e.g. Lead Frontend Developer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Company Name</label>
            <input required type="text" placeholder="e.g. Stripe Inc" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Location</label>
            <input required type="text" placeholder="e.g. San Francisco, CA or Remote" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Job Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white appearance-none">
              <option className="bg-[#0f172a]">Full-time</option>
              <option className="bg-[#0f172a]">Part-time</option>
              <option className="bg-[#0f172a]">Internship</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Salary Range</label>
            <input required type="text" placeholder="e.g. $120,000 - $140,000" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Tags (comma separated)</label>
            <input type="text" placeholder="React, Python, Node" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Total Rounds</label>
            <input required type="number" min="1" max="10" placeholder="1" value={formData.total_rounds} onChange={handleRoundsChange} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white" />
          </div>
        </div>

        {/* Dynamic Round Types */}
        <div className="p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg">
          <label className="block text-xs text-slate-700 dark:text-slate-300 mb-3 font-bold flex items-center gap-2"><CheckCircle size={14} className="text-[#8b5cf6]" /> Round Definitions</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roundTypes.map((rt, idx) => (
              <div key={idx}>
                <label className="block text-[10px] text-slate-500 dark:text-slate-500 mb-1">Round {idx + 1} Type</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Technical Interview" 
                  value={rt} 
                  onChange={e => handleRoundTypeChange(idx, e.target.value)} 
                  className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded p-2 text-xs text-slate-800 dark:text-slate-200" 
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Detailed Job Description</label>
          <textarea required rows={4} placeholder="Summarize skills, day-to-day requirements, and technology specifications..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 resize-none" />
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Upload JD File (PDF)</label>
          <input id="jdFile" type="file" accept=".pdf,.doc,.docx" onChange={e => setSelectedJdFile(e.target.files[0])} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200" />
        </div>
        
        <FlatButton type="submit" variant="primary" className="w-full bg-[#10b981] hover:bg-[#059669] text-slate-900 dark:text-white py-3 text-xs font-bold mt-4">
          Post & Submit for Admin Approval
        </FlatButton>
      </form>
    </GlassCard>
  )}

export default InterviewerDashboard;
