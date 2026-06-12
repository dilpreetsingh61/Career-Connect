import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, Clock, Briefcase, X, FileText, Download } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import FlatButton from '../components/ui/FlatButton';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [expandedJobId, setExpandedJobId] = useState(null);

  // Application Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setLoading(false);
      });

    if (token && user?.role === 'STUDENT') {
      fetch('/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setResumes(data);
        if (data.length > 0) setSelectedResumeId(data[0].id);
      })
      .catch(console.error);
    }
  }, [token, user]);

  const handleApplyClick = (job) => {
    if (!user) return alert('Please login to apply');
    if (user.role !== 'STUDENT') return alert('Only students can apply for jobs');
    setSelectedJob(job);
    setShowModal(true);
  };

  const submitApplication = async () => {
    if (!selectedResumeId) return alert('Please select a resume. Go to the Resume Builder to create one.');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ job_id: selectedJob.id, resume_id: selectedResumeId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Application submitted successfully!');
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Live client-side job matching filter
  const filteredJobs = jobs.filter(job => {
    const searchClean = searchQuery.toLowerCase().trim();
    const locClean = locationQuery.toLowerCase().trim();

    const matchesSearch = !searchClean || 
      job.title.toLowerCase().includes(searchClean) ||
      job.company.toLowerCase().includes(searchClean) ||
      (job.tags && job.tags.some(t => t.toLowerCase().includes(searchClean)));

    const matchesLoc = !locClean || 
      job.location.toLowerCase().includes(locClean);

    return matchesSearch && matchesLoc;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Briefcase className="text-[#0ea5e9]" /> Job Opportunities</h1>
        <p className="text-slate-600 dark:text-slate-400">Find your next role matched to your skills and preferences.</p>
      </div>

      {/* Interactive Connected Search Panel */}
      <GlassCard className="mb-8 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by job title, skill, or company name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">&times;</button>
            )}
          </div>
          <div className="relative md:w-64">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by location..." 
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
            />
            {locationQuery && (
              <button onClick={() => setLocationQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">&times;</button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Jobs Listing */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-12 text-sm italic">Loading job postings...</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-slate-500 text-center py-12 text-sm italic">No matching job listings found.</p>
        ) : filteredJobs.map(job => (
          <GlassCard key={job.id} className="hover:border-slate-300 dark:hover:border-white/15 transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5"><Building size={14} /> {job.company}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {job.type}</span>
                  <span className="text-[#10b981] font-bold">{job.salary}</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.tags && job.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-slate-600 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Job Description expander */}
                {job.description && (
                  <div className="mt-3 border-t border-slate-200 dark:border-white/5 pt-3">
                    <button 
                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      className="text-xs text-[#0ea5e9] hover:underline font-medium"
                    >
                      {expandedJobId === job.id ? "Hide Detailed Job Description" : "View Detailed Job Description"}
                    </button>
                    
                    {expandedJobId === job.id && (
                      <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-black/20 p-3 rounded-lg border border-slate-200 dark:border-white/5">
                        {job.description}
                        
                        {job.jd_url && (
                          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/5 flex items-center gap-2">
                            <FileText size={12} className="text-[#0ea5e9]" />
                            <a 
                              href={job.jd_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-[#10b981] hover:underline font-bold flex items-center gap-1"
                            >
                              <Download size={10} /> Download Job Attachment (JD.pdf)
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col justify-between items-end gap-3 min-w-[120px]">
                <span className="text-[10px] text-slate-500 font-mono">Posted: {new Date(job.created_at || Date.now()).toLocaleDateString()}</span>
                <FlatButton onClick={() => handleApplyClick(job)} variant="primary" className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs w-full md:w-auto py-1.5 px-4 font-bold">
                  Apply Now
                </FlatButton>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {showModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-lg p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Apply for {selectedJob.title}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium">{selectedJob.company}</p>
            
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Resume to Apply With</label>
              {resumes.length > 0 ? (
                <select 
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#0ea5e9] transition-colors appearance-none"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">{r.title} (Score: {r.ai_score}%)</option>
                  ))}
                </select>
              ) : (
                <div className="p-4 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs leading-relaxed">
                  You don't have any resumes uploaded. Please go to the Resume Builder to upload one before applying.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5">
              <FlatButton onClick={() => setShowModal(false)} variant="outline" className="border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                Cancel
              </FlatButton>
              <FlatButton 
                onClick={submitApplication} 
                variant="primary" 
                disabled={resumes.length === 0}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs disabled:opacity-50 font-bold px-4"
              >
                Submit Application
              </FlatButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Jobs;
