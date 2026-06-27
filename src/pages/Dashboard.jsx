import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, Briefcase as BriefcaseIcon, Sparkles, BookOpen, Target, ArrowRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { Tabs } from '../components/ui/Tabs';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    if (token && user?.role === 'STUDENT') {
      // 1. Fetch applications
      fetch('/api/applications/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setApplications(data))
      .catch(console.error);

      // 2. Fetch profile skills
      fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setSkills(data.skills || []))
      .catch(console.error);

      // 3. Fetch active jobs
      fetch('/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setActiveJobs(data))
      .catch(console.error);

      // 4. Fetch learning/interview guides
      fetch('/api/resources?type=interview_prep', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setGuides(data))
      .catch(console.error);
    }
  }, [token, user]);

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab applications={applications} skills={skills} /> },
    { id: 'ai-suggestions', label: 'AI suggestions & Guidance', content: <AISuggestionsTab skills={skills} activeJobs={activeJobs} guides={guides} /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Here's a premium diagnostic look at your career path today.</p>
      </div>

      <Tabs tabs={tabs} defaultTab="overview" />
    </div>
  );
};

const OverviewTab = ({ applications, skills }) => {
  const safeApps = Array.isArray(applications) ? applications : [];
  const totalApps = safeApps.length || 0;
  const interviews = safeApps.filter(a => a.status === 'interview_scheduled').length || 0;
  const successRate = totalApps > 0 ? Math.round(((safeApps.filter(a => ['shortlisted', 'interview_scheduled', 'selected'].includes(a.status)).length) / totalApps) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={totalApps} trend="Active applications log" icon={BriefcaseIcon} color="#0ea5e9" />
        <StatCard title="Interviews Scheduled" value={interviews} trend="Google Meet scheduled" icon={Clock} color="#8b5cf6" />
        <StatCard title="Application Success" value={`${successRate}%`} trend="Shortlist transition rate" icon={TrendingUp} color="#10b981" />
        <StatCard title="Profile Skills Set" value={skills.length} trend="Synced to database profile" icon={CheckCircle} color="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Application Engagement Rate</h3>
            {/* Visual engagement analytics bar representation */}
            <div className="flex-1 border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-black/20 flex flex-col justify-between p-6">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                <span>Applied ({safeApps.filter(a => a.status === 'applied').length})</span>
                <span>Shortlisted ({safeApps.filter(a => a.status === 'shortlisted').length})</span>
                <span>Interviews ({interviews})</span>
                <span>Selected ({safeApps.filter(a => a.status === 'selected').length})</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex border border-slate-200 dark:border-white/10 my-4">
                <div style={{ width: `${totalApps ? (safeApps.filter(a => a.status === 'applied').length / totalApps) * 100 : 0}%` }} className="bg-[#0ea5e9] h-full transition-all"></div>
                <div style={{ width: `${totalApps ? (safeApps.filter(a => a.status === 'shortlisted').length / totalApps) * 100 : 0}%` }} className="bg-[#a855f7] h-full transition-all"></div>
                <div style={{ width: `${totalApps ? (interviews / totalApps) * 100 : 0}%` }} className="bg-[#8b5cf6] h-full transition-all"></div>
                <div style={{ width: `${totalApps ? (safeApps.filter(a => a.status === 'selected').length / totalApps) * 100 : 0}%` }} className="bg-[#10b981] h-full transition-all"></div>
              </div>
              <div className="text-center text-xs text-slate-500 dark:text-slate-500">
                Interactive real-time career diagnostic parameters computed locally.
              </div>
            </div>
          </GlassCard>
        </div>
        
        <div>
          <GlassCard className="h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Status Alerts</h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {safeApps.length > 0 ? safeApps.map(app => {
                let displayStatus = app.status.replace('_', ' ');
                if ((app.status === 'shortlisted' || app.status === 'interview_scheduled') && app.current_round && app.Job?.round_types) {
                  try {
                    const rounds = typeof app.Job.round_types === 'string' ? JSON.parse(app.Job.round_types) : app.Job.round_types;
                    if (Array.isArray(rounds) && rounds[app.current_round - 1]) {
                      displayStatus = `${displayStatus} - ${rounds[app.current_round - 1]}`;
                    }
                  } catch (e) {}
                }

                return (
                <div key={app.id} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                  <div className="truncate pr-2">
                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{app.Job?.title}</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">{app.Job?.company}</div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono border uppercase tracking-wider ${
                    app.status === 'selected' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' :
                    app.status === 'interview_scheduled' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20' :
                    app.status === 'shortlisted' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20' :
                    app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5'
                  }`}>
                    {displayStatus}
                  </span>
                </div>
              )}) : (
                <div className="text-center py-16 text-slate-500 dark:text-slate-500 text-xs italic">
                  No active job applications found.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const AISuggestionsTab = ({ skills, activeJobs, guides }) => {
  // 1. Compute recommended roles based on keyword/skills intersection
  const recommendations = activeJobs.filter(job => {
    if (!job.tags || job.tags.length === 0) return false;
    return job.tags.some(tag => skills.map(s => s.toLowerCase()).includes(tag.toLowerCase()));
  }).slice(0, 3);

  // 2. Compute trending market demand keywords
  const marketTags = {};
  activeJobs.forEach(job => {
    if (job.tags) {
      job.tags.forEach(tag => {
        const clean = tag.toLowerCase();
        marketTags[clean] = (marketTags[clean] || 0) + 1;
      });
    }
  });

  const sortedDemand = Object.entries(marketTags)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  // Skill Gaps: trending in market but missing in student skills
  const gaps = sortedDemand
    .filter(tag => !skills.map(s => s.toLowerCase()).includes(tag))
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recommended Roles List */}
      <div className="lg:col-span-1 space-y-4">
        <GlassCard className="h-full relative overflow-hidden border-t-4 border-[#0ea5e9]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#0ea5e9]/10 blur-xl"></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Sparkles size={18} className="text-[#0ea5e9]" /> Match Roles
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">Active jobs matching your profile database skills.</p>

          <div className="space-y-3">
            {recommendations.length > 0 ? recommendations.map(job => (
              <div key={job.id} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:border-slate-300 dark:hover:border-[#0ea5e9]/40 transition-all">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{job.title}</h4>
                <p className="text-[10px] text-[#0ea5e9] font-medium mb-2">{job.company} • {job.location}</p>
                <div className="flex flex-wrap gap-1">
                  {job.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-center py-16 text-slate-600 dark:text-slate-500 text-xs italic border border-dashed border-slate-300 dark:border-white/10 rounded-xl">
                {skills.length === 0 ? "Add tech skills to your Resume to fetch matching roles." : "No perfect matches found. Expand your skills profile!"}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Skill Gap Analysis chart */}
      <div className="lg:col-span-1 space-y-4">
        <GlassCard className="h-full relative overflow-hidden border-t-4 border-[#8b5cf6]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#8b5cf6]/10 blur-xl"></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Target size={18} className="text-[#8b5cf6]" /> Market Skill Gaps
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">Trending keywords in postings that you haven't listed yet.</p>

          <div className="space-y-4">
            {gaps.length > 0 ? gaps.map((gap, index) => (
              <div key={gap} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300 capitalize">{gap}</span>
                  <span className="text-red-400 font-mono">Missing ({100 - index * 10}%)</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-[#8b5cf6] rounded-full" style={{ width: `${80 - index * 15}%` }} />
                </div>
              </div>
            )) : (
              <div className="text-center py-16 text-slate-600 dark:text-slate-500 text-xs italic border border-dashed border-slate-300 dark:border-white/10 rounded-xl">
                {activeJobs.length === 0 ? "No active jobs to perform gaps audit." : "Incredible! Your skills cover all trending tags."}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Admin Centralized Prep Guides */}
      <div className="lg:col-span-1 space-y-4">
        <GlassCard className="h-full relative overflow-hidden border-t-4 border-[#10b981]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#10b981]/10 blur-xl"></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <BookOpen size={18} className="text-[#10b981]" /> Prep Guidance
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">Official materials and interview diagnostics compiled by admins.</p>

          <div className="space-y-3">
            {guides.length > 0 ? guides.map(guide => (
              <div key={guide.id} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{guide.title}</h4>
                    <ArrowRight size={12} className="text-slate-500 group-hover:text-[#10b981] transition-colors mt-0.5 flex-shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">{guide.content}</p>
                </div>
                {guide.file_url && (
                  <a href={`${guide.file_url}`} target="_blank" rel="noopener noreferrer" className="mt-2 text-[10px] text-[#10b981] font-bold hover:underline self-start">
                    Download Attached File
                  </a>
                )}
              </div>
            )) : (
              <div className="text-center py-16 text-slate-600 dark:text-slate-500 text-xs italic border border-dashed border-slate-300 dark:border-white/10 rounded-xl">
                No official preparation guides uploaded by Admins yet.
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon: Icon, color }) => (
  <GlassCard className="flex flex-col gap-2 relative overflow-hidden">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-slate-600 dark:text-slate-400 text-xs font-medium">{title}</h3>
      <Icon size={16} color={color} />
    </div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
    <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">{trend}</div>
    <div 
      className="absolute bottom-0 right-0 w-12 h-12 blur-2xl rounded-full opacity-20"
      style={{ backgroundColor: color }}
    ></div>
  </GlassCard>
);

export default Dashboard;
