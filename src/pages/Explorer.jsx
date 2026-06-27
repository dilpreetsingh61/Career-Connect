import React, { useState, useEffect } from 'react';
import { Compass, BookOpen, Star, Award, ExternalLink, Activity } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';

const Explorer = () => {
  const { token } = useAuth();
  const [guidance, setGuidance] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // 1. Fetch career guidance articles
      fetch('/api/resources?type=career_guidance', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setGuidance(data))
      .catch(console.error);

      // 2. Fetch jobs to analyze tags
      fetch('/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [token]);

  // Analyze trending skills from active jobs tags frequency
  const tagFreq = {};
  jobs.forEach(j => {
    if (j.tags) {
      j.tags.forEach(t => {
        const clean = t.trim();
        if (clean) {
          tagFreq[clean] = (tagFreq[clean] || 0) + 1;
        }
      });
    }
  });

  const trendingSkills = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const companies = {};
  jobs.forEach(j => {
    if (j.company) {
      const c = j.company;
      companies[c] = (companies[c] || 0) + 1;
    }
  });
  
  const featuredRecruiters = Object.entries(companies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const colors = ['#0ea5e9', '#10b981', '#8b5cf6', '#a855f7', '#f43f5e', '#eab308'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Compass className="text-[#8b5cf6]" /> Career Explore
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Discover new career articles, learning guidance paths, and live industry trending tags.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Career Guidance articles column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-[#0ea5e9]" size={18} /> Dynamic Learning Paths & Guides
          </h2>
          
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400 text-xs italic">Loading Explore feeds...</p>
          ) : guidance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guidance.map((path, index) => {
                const accentColor = colors[index % colors.length];
                return (
                  <GlassCard key={path.id} className="relative overflow-hidden group hover:-translate-y-1 transition-transform border border-slate-200 dark:border-white/5 flex flex-col">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Award size={54} color={accentColor} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 truncate">
                        <span style={{ backgroundColor: accentColor }} className="w-2 h-2 rounded-full inline-block"></span>
                        {path.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed mb-4">{path.content}</p>
                    </div>
                    
                    {path.file_url && (
                      <a href={`${path.file_url}`} target="_blank" rel="noopener noreferrer" className="mb-4 text-[10px] text-[#0ea5e9] font-bold hover:underline self-start flex items-center gap-1">
                        <ExternalLink size={10} /> Download Associated Material
                      </a>
                    )}
                    
                    <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono flex items-center gap-1 mt-auto border-t border-slate-200 dark:border-white/5 pt-2">
                      <span>Publisher: Admin •</span>
                      <span>Scanned {new Date(path.created_at).toLocaleDateString()}</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <GlassCard className="py-12 border border-dashed border-slate-300 dark:border-white/10 text-center text-slate-500 dark:text-slate-500 text-xs italic">
              No learning guides posted yet. Ask your Admins to publish preparation content!
            </GlassCard>
          )}

          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-8">
            <Star className="text-yellow-500" size={18} /> Featured Campus Recruiters
          </h2>
          {featuredRecruiters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredRecruiters.map(([company, count], idx) => (
                <GlassCard key={company} className="relative overflow-hidden hover:-translate-y-1 transition-transform border border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-slate-900 dark:text-white bg-gradient-to-br ${
                      idx % 3 === 0 ? 'from-blue-500 to-cyan-500' :
                      idx % 3 === 1 ? 'from-purple-500 to-pink-500' :
                      'from-green-500 to-emerald-500'
                    }`}>
                      {company.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{company}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{count} Active Listing{count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="py-8 border border-dashed border-slate-300 dark:border-white/10 text-center text-slate-500 dark:text-slate-500 text-xs italic">
              No active campus recruiters catalogued at the moment.
            </GlassCard>
          )}
        </div>

        {/* Live Trending Tags sidebar */}
        <div>
          <GlassCard className="sticky top-24 border-l-2 border-[#8b5cf6]">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Activity size={16} className="text-[#8b5cf6]" /> Live Job Skill Trends
            </h3>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-4">Calculated from total tag occurrence counts in approved database job postings.</p>

            <div className="space-y-4">
              {trendingSkills.length > 0 ? (
                trendingSkills.map(([skill, count], i) => {
                  const percent = Math.min(100, Math.max(25, (count / jobs.length) * 100));
                  return (
                    <div key={skill} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{skill}</span>
                        <span className="text-slate-500 dark:text-slate-500 font-mono text-[10px]">{count} Active Postings ({Math.round(percent)}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 dark:text-slate-500 text-xs italic py-6 text-center">No active job listings to compute market demand tags.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
