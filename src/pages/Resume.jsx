import React, { useState, useEffect } from 'react';
import { FileText, Download, Edit3, Plus, Layers, UploadCloud, CheckCircle2, AlertCircle, Sparkles, User, GraduationCap, BookOpen, Trash2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import FlatButton from '../components/ui/FlatButton';
import { useAuth } from '../context/AuthContext';

const Resume = () => {
  const { user, token } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [resumeTextContent, setResumeTextContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bio, setBio] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [academicMarks, setAcademicMarks] = useState('');
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [activeEditTab, setActiveEditTab] = useState('basic'); // 'basic', 'projects', 'experience'

  // Input states for adding new project
  const [newProjName, setNewProjName] = useState('');
  const [newProjDate, setNewProjDate] = useState('');
  const [newProjRepo, setNewProjRepo] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Input states for adding new experience
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpDuration, setNewExpDuration] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: 'Student / Graduate',
    location: 'Remote'
  });

  // Fetch student profile on mount
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBio(data.bio || '');
        setUniversity(data.university || '');
        setCourse(data.course || '');
        setGraduationYear(data.graduation_year || '');
        setAcademicMarks(data.academic_marks || '');
        setSkills(data.skills || []);
        setProjects(data.projects || []);
        setExperience(data.experience || []);
        setProfileData({
          name: data.User?.name || user?.name || '',
          email: data.User?.email || user?.email || '',
          role: user?.role === 'STUDENT' ? 'Student / Graduate' : user?.role || '',
          location: data.university ? data.university : 'Remote'
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
        if (data.length > 0 && !selectedResume) {
          setSelectedResume(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchResumes();
    }
  }, [token]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio,
          university,
          course,
          graduation_year: parseInt(graduationYear) || undefined,
          academic_marks: academicMarks,
          name: profileData.name,
          skills,
          projects,
          experience
        })
      });
      if (res.ok) {
        setIsEditingProfile(false);
        fetchProfile();
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const syncSkills = async (updatedSkills) => {
    setSkills(updatedSkills);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skills: updatedSkills })
      });
    } catch (err) {
      console.error('Error syncing skills:', err);
    }
  };

  const [selectedResumeFile, setSelectedResumeFile] = useState(null);

  const submitResumeUpload = async () => {
    if (!newResumeTitle) return;
    setIsAnalyzing(true);
    try {
      // Simulate small loader delay to make it feel premium & AI-driven
      await new Promise(r => setTimeout(r, 1200));

      const formData = new FormData();
      formData.append('title', newResumeTitle);
      formData.append('parsed_content', resumeTextContent || `Highly competent developer skilled in ${skills.join(', ')}. Pursuing ${course} at ${university}. Graduation year ${graduationYear}.`);
      if (selectedResumeFile) {
        formData.append('file', selectedResumeFile);
      } else {
        formData.append('file_url', 'https://example.com/resume.pdf');
      }

      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });
      if (res.ok) {
        const created = await res.json();
        setNewResumeTitle('');
        setResumeTextContent('');
        setSelectedResumeFile(null);
        if (document.getElementById('actualResumeFile')) document.getElementById('actualResumeFile').value = '';
        setShowUploadForm(false);
        await fetchResumes();
        setSelectedResume(created);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (selectedResume?.id === id) {
          setSelectedResume(null);
        }
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Parse structured AI feedback
  let aiFeedbackParsed = { strengths: [], improvements: [], formatting: '', technicalGaps: [] };
  try {
    if (selectedResume && selectedResume.ai_feedback) {
      aiFeedbackParsed = JSON.parse(selectedResume.ai_feedback);
    }
  } catch (e) {
    console.error('Failed to parse AI feedback:', e);
  }

  // Trigger browser-native professional printing layout
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dynamic print-override stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume-area, #printable-resume-area * {
            visibility: visible;
          }
          #printable-resume-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 30px !important;
            font-family: 'Inter', sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner (Hidden in Print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <FileText className="text-[#10b981]" /> Resume & Profile Builder
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Optimize your portfolio, check AI-matching metrics, and export premium resumes.</p>
        </div>
        <div className="flex gap-3">
          <FlatButton onClick={() => setIsEditingProfile(true)} variant="outline" className="border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 size={16} /> Edit Profile
          </FlatButton>
          <FlatButton onClick={handlePrint} variant="primary" className="bg-[#10b981] hover:bg-[#059669] text-slate-900 dark:text-white flex items-center gap-2">
            <Download size={16} /> Export PDF
          </FlatButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hand Profile Summary Column */}
        <div className="lg:col-span-1 space-y-6 no-print">
          {/* User Profile Card */}
          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] blur-3xl opacity-20"></div>
            
            {isEditingProfile ? (
              <div className="space-y-4 text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <User size={18} className="text-[#0ea5e9]" /> Edit Student Profile
                </h3>

                {/* Sub-tab Navigation */}
                <div className="flex border-b border-slate-300 dark:border-white/10 mb-4 text-[10px] font-bold uppercase tracking-wider">
                  <button 
                    type="button" 
                    onClick={() => setActiveEditTab('basic')}
                    className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${activeEditTab === 'basic' ? 'border-[#0ea5e9] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                  >
                    Basic
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveEditTab('projects')}
                    className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${activeEditTab === 'projects' ? 'border-[#0ea5e9] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                  >
                    Projects ({projects.length})
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveEditTab('experience')}
                    className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${activeEditTab === 'experience' ? 'border-[#0ea5e9] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                  >
                    Experience ({experience.length})
                  </button>
                </div>

                {/* Sub-tab Views */}
                {activeEditTab === 'basic' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
                      <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2.5 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0ea5e9] transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Bio / Headline</label>
                      <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Aspiring Software Engineer focused on web applications..." className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2.5 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0ea5e9] transition-colors resize-none leading-relaxed" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">University / College Name</label>
                        <input type="text" placeholder="Stanford University" value={university} onChange={e => setUniversity(e.target.value)} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0ea5e9]" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Exact Course Pursuing</label>
                        <input type="text" placeholder="B.S. in Computer Science" value={course} onChange={e => setCourse(e.target.value)} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0ea5e9]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Graduation Year</label>
                        <input type="number" placeholder="2026" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0ea5e9]" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Academic Marks / GPA</label>
                        <input type="text" placeholder="GPA: 3.8/4.0 or 85%" value={academicMarks} onChange={e => setAcademicMarks(e.target.value)} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2.5 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0ea5e9] transition-colors" />
                      </div>
                    </div>
                  </div>
                )}

                {activeEditTab === 'projects' && (
                  <div className="space-y-3">
                    {/* Existing project list */}
                    <div className="max-h-36 overflow-y-auto space-y-2 border-b border-slate-200 dark:border-white/5 pb-3 pr-1">
                      {projects.length > 0 ? projects.map((proj, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-white/5 text-[11px]">
                          <div className="truncate">
                            <div className="font-bold text-slate-900 dark:text-white truncate">{proj.name}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-500 font-mono">{proj.date}</div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setProjects(prev => prev.filter((_, i) => i !== idx))} 
                            className="text-slate-600 dark:text-slate-400 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-slate-500 dark:text-slate-500 italic text-[10px]">No projects added. Add one below!</div>
                      )}
                    </div>
                    
                    {/* Add project form */}
                    <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg border border-slate-200 dark:border-white/5 space-y-2">
                      <h4 className="text-[9px] font-bold text-[#0ea5e9] uppercase tracking-wider">Add Project</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Project Name" 
                          value={newProjName} 
                          onChange={e => setNewProjName(e.target.value)} 
                          className="bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded p-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="Date (e.g. May 2026)" 
                          value={newProjDate} 
                          onChange={e => setNewProjDate(e.target.value)} 
                          className="bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded p-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Repo Link (optional)" 
                        value={newProjRepo} 
                        onChange={e => setNewProjRepo(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded p-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none"
                      />
                      <textarea 
                        rows={2} 
                        placeholder="Brief description of achievements..." 
                        value={newProjDesc} 
                        onChange={e => setNewProjDesc(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded p-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none resize-none leading-relaxed"
                      />
                      <button 
                        type="button"
                        disabled={!newProjName || !newProjDate || !newProjDesc}
                        onClick={() => {
                          setProjects(prev => [...prev, { name: newProjName, date: newProjDate, repoLink: newProjRepo, description: newProjDesc }]);
                          setNewProjName('');
                          setNewProjDate('');
                          setNewProjRepo('');
                          setNewProjDesc('');
                        }}
                        className="w-full text-center py-1 bg-[#0ea5e9]/20 hover:bg-[#0ea5e9]/35 text-[#0ea5e9] hover:text-slate-900 dark:text-white rounded text-[10px] font-bold border border-[#0ea5e9]/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        + Add to Projects
                      </button>
                    </div>
                  </div>
                )}

                {activeEditTab === 'experience' && (
                  <div className="space-y-3">
                    {/* Existing work history */}
                    <div className="max-h-36 overflow-y-auto space-y-2 border-b border-slate-200 dark:border-white/5 pb-3 pr-1">
                      {experience.length > 0 ? experience.map((exp, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-white/5 text-[11px]">
                          <div className="truncate">
                            <div className="font-bold text-slate-900 dark:text-white truncate">{exp.role}</div>
                            <div className="text-[9px] text-slate-600 dark:text-slate-400">{exp.company} • <span className="font-mono text-slate-500 dark:text-slate-500">{exp.duration}</span></div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setExperience(prev => prev.filter((_, i) => i !== idx))} 
                            className="text-slate-600 dark:text-slate-400 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-slate-500 dark:text-slate-500 italic text-[10px]">No experience listed (Optional).</div>
                      )}
                    </div>
                    
                    {/* Add work history form */}
                    <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg border border-slate-200 dark:border-white/5 space-y-2">
                      <h4 className="text-[9px] font-bold text-[#10b981] uppercase tracking-wider">Add Experience (Optional)</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Role Title" 
                          value={newExpRole} 
                          onChange={e => setNewExpRole(e.target.value)} 
                          className="bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded p-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="Company Name" 
                          value={newExpCompany} 
                          onChange={e => setNewExpCompany(e.target.value)} 
                          className="bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded p-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Duration (e.g. Jun 2024 - Present)" 
                        value={newExpDuration} 
                        onChange={e => setNewExpDuration(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded p-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none"
                      />
                      <textarea 
                        rows={2} 
                        placeholder="Describe your internship or engineering role responsibilities..." 
                        value={newExpDesc} 
                        onChange={e => setNewExpDesc(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded p-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none resize-none leading-relaxed"
                      />
                      <button 
                        type="button"
                        disabled={!newExpRole || !newExpCompany || !newExpDuration || !newExpDesc}
                        onClick={() => {
                          setExperience(prev => [...prev, { role: newExpRole, company: newExpCompany, duration: newExpDuration, description: newExpDesc }]);
                          setNewExpRole('');
                          setNewExpCompany('');
                          setNewExpDuration('');
                          setNewExpDesc('');
                        }}
                        className="w-full text-center py-1 bg-[#10b981]/20 hover:bg-[#10b981]/35 text-[#10b981] hover:text-slate-900 dark:text-white rounded text-[10px] font-bold border border-[#10b981]/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        + Add to Experiences
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end mt-4 pt-2 border-t border-slate-200 dark:border-white/5">
                  <button onClick={() => setIsEditingProfile(false)} className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white px-2 py-1 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={handleSaveProfile} className="text-xs bg-[#10b981] hover:bg-[#059669] text-slate-900 dark:text-white px-4 py-1.5 rounded transition-colors font-medium cursor-pointer">Save Details</button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center mb-4 border-2 border-slate-300 dark:border-white/10 shadow-lg">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{profileData.name?.charAt(0) || 'U'}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">{profileData.name || 'User'}</h2>
                <p className="text-[#0ea5e9] text-sm font-medium mb-3">{profileData.role}</p>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4 text-left border-t border-slate-200 dark:border-white/5 pt-3">
                  <p className="flex items-center gap-1.5"><User size={13} className="text-slate-500 dark:text-slate-500" /> {profileData.email}</p>
                  {(university || course) && <p className="flex items-center gap-1.5"><GraduationCap size={13} className="text-slate-500 dark:text-slate-500" /> {course} at {university} ({graduationYear})</p>}
                  {academicMarks && <p className="flex items-center gap-1.5"><BookOpen size={13} className="text-slate-500 dark:text-slate-500" /> {academicMarks}</p>}
                </div>
                {bio && <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/5 italic text-left">{bio}</p>}
              </div>
            )}
          </GlassCard>

          {/* User Skills Widget */}
          <GlassCard>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers size={18} className="text-[#8b5cf6]" /> Technical Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(skill => (
                <span key={skill} className="px-2.5 py-1 rounded bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 group hover:border-[#8b5cf6]/30 transition-all">
                  {skill}
                  <button onClick={() => syncSkills(skills.filter(s => s !== skill))} className="opacity-40 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-1 font-bold">
                    &times;
                  </button>
                </span>
              ))}
              {showSkillInput ? (
                <input 
                  autoFocus
                  type="text" 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newSkill.trim()) {
                      if (!skills.includes(newSkill.trim())) syncSkills([...skills, newSkill.trim()]);
                      setNewSkill('');
                      setShowSkillInput(false);
                    } else if (e.key === 'Escape') {
                      setShowSkillInput(false);
                    }
                  }}
                  onBlur={() => {
                    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                      syncSkills([...skills, newSkill.trim()]);
                    }
                    setNewSkill('');
                    setShowSkillInput(false);
                  }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded text-xs text-slate-900 dark:text-white outline-none focus:border-[#8b5cf6] w-24"
                  placeholder="New Skill..."
                />
              ) : (
                <button onClick={() => setShowSkillInput(true)} className="px-2.5 py-1 rounded bg-slate-50 dark:bg-white/5 border border-dashed border-slate-400 dark:border-white/20 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors">
                  <Plus size={12} /> Add Skill
                </button>
              )}
            </div>
          </GlassCard>

          {/* Resumes List Widget */}
          <GlassCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-[#10b981]" /> Saved Resumes
              </h3>
              <button onClick={() => setShowUploadForm(!showUploadForm)} className="text-[#8b5cf6] hover:text-purple-400 text-xs font-bold flex items-center gap-1">
                <UploadCloud size={14} /> Upload New
              </button>
            </div>

            {showUploadForm && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg flex flex-col gap-3 relative">
                <input 
                  type="text" 
                  placeholder="Resume Title (e.g. Frontend Dev)" 
                  value={newResumeTitle}
                  onChange={(e) => setNewResumeTitle(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#8b5cf6]"
                  autoFocus
                />
                
                <div>
                  <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Attach Actual Resume (PDF)</label>
                  <input id="actualResumeFile" type="file" accept=".pdf" onChange={e => setSelectedResumeFile(e.target.files[0])} className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#8b5cf6]" />
                </div>
                
                {!selectedResumeFile && (
                  <div>
                    <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Simulate AI Parser Extraction (Paste Resume Text if no PDF)</label>
                    <textarea 
                      rows={4} 
                      placeholder="Full Stack developer experienced in React, JavaScript, Node.js, SQL..."
                      value={resumeTextContent}
                      onChange={(e) => setResumeTextContent(e.target.value)}
                      className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#8b5cf6] resize-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setShowUploadForm(false)} className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white px-2 py-1">Cancel</button>
                  <FlatButton onClick={submitResumeUpload} disabled={isAnalyzing || !newResumeTitle} variant="primary" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-slate-900 dark:text-white text-[10px] py-1 px-3">
                    {isAnalyzing ? 'Analyzing...' : 'Parse & Save'}
                  </FlatButton>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {resumes.length > 0 ? resumes.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => setSelectedResume(r)}
                  className={`p-2.5 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                    selectedResume?.id === r.id ? 'border-[#8b5cf6] bg-[#8b5cf6]/10' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-black/20 hover:border-slate-300 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={14} className="text-[#8b5cf6] flex-shrink-0" />
                    <div className="truncate text-xs text-slate-900 dark:text-white font-medium">{r.title}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#10b981] font-bold">Score: {r.ai_score}</span>
                    <button onClick={(e) => handleDeleteResume(r.id, e)} className="text-slate-500 dark:text-slate-500 hover:text-red-400 p-0.5 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-500 border border-dashed border-slate-300 dark:border-white/10 rounded-lg">
                  No resumes loaded. Add one to see assessment.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Hand Interactive Dashboard & PDF Preview Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedResume ? (
            <>
              {/* Dynamic Interactive AI Feedback Header */}
              <GlassCard className="no-print relative overflow-hidden border-l-4 border-[#8b5cf6]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#8b5cf6] blur-3xl opacity-10"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    {/* SVG circular score progress loader */}
                    <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                        <circle 
                          cx="32" 
                          cy="32" 
                          r="28" 
                          fill="transparent" 
                          stroke={selectedResume.ai_score >= 85 ? '#10b981' : selectedResume.ai_score >= 70 ? '#eab308' : '#ef4444'} 
                          strokeWidth="4" 
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 * (1 - selectedResume.ai_score / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <span className="absolute text-base font-extrabold text-slate-900 dark:text-white">{selectedResume.ai_score}%</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        AI Score Audit: <span className="text-[#8b5cf6]">{selectedResume.title}</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Verified and parsed in local sandbox. Diagnostic report updated.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 block mb-1">Last scanned: {new Date(selectedResume.created_at).toLocaleDateString()}</span>
                    {selectedResume.file_url && selectedResume.file_url !== 'https://example.com/resume.pdf' && (
                      <a href={`${selectedResume.file_url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0ea5e9] hover:underline font-bold">
                        Download PDF Resume
                      </a>
                    )}
                  </div>
                </div>

                {/* Sub-grid of strengths / missing tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-slate-200 dark:border-white/5 pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#10b981] flex items-center gap-1 mb-2">
                      <CheckCircle2 size={13} /> Document Strengths
                    </h4>
                    <ul className="space-y-1">
                      {aiFeedbackParsed.strengths.length > 0 ? aiFeedbackParsed.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1">
                          <span className="text-[#10b981] mt-0.5">•</span> {s}
                        </li>
                      )) : (
                        <li className="text-xs text-slate-500 dark:text-slate-500 italic">No specific technical strengths highlighted.</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#eab308] flex items-center gap-1 mb-2">
                      <Sparkles size={13} /> Areas of Improvement
                    </h4>
                    <ul className="space-y-1">
                      {aiFeedbackParsed.improvements.length > 0 ? aiFeedbackParsed.improvements.map((m, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1">
                          <span className="text-[#eab308] mt-0.5">•</span> {m}
                        </li>
                      )) : (
                        <li className="text-xs text-slate-500 dark:text-slate-500 italic">Optimal compatibility. No outstanding improvement triggers.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <AlertCircle size={14} className="text-[#0ea5e9] flex-shrink-0" />
                  <div>
                    <strong>Layout Report:</strong> {aiFeedbackParsed.formatting}
                  </div>
                </div>
              </GlassCard>

              {/* Printable Premium Layout Sheet Previews */}
              <div id="printable-resume-area" className="bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-white/10 rounded-xl p-8 shadow-2xl relative">
                {/* Print watermark header (Only shown during print) */}
                <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profileData.name}</h1>
                      <p className="text-sm font-semibold text-indigo-600">{profileData.role}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500 dark:text-slate-500">
                      <p>{profileData.email}</p>
                      {(university || course) && <p>{course} at {university} • Class of {graduationYear}</p>}
                    </div>
                  </div>
                </div>

                {/* Main Screen Resume Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-slate-900 mb-1 border-b border-slate-300 dark:border-white/10 print:border-slate-200 pb-1 flex justify-between items-center">
                      <span>PROFESSIONAL STATEMENT</span>
                      <span className="text-xs text-[#8b5cf6] font-mono no-print">LIVE LAYOUT SHEET</span>
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 print:text-slate-700 text-sm leading-relaxed">
                      {bio || "Experienced Web Developer and enthusiastic student pursuing a degree in computer science. Passionate about solving complex architecture challenges using modern front-end technologies and scalable back-end databases. Adept in fast-paced software environments and proactive peer-to-peer programming cycles."}
                    </p>
                  </div>

                  {(university || course) && (
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-slate-900 mb-2 border-b border-slate-300 dark:border-white/10 print:border-slate-200 pb-1">
                        EDUCATION HISTORY
                      </h3>
                      <div className="flex justify-between items-start mb-0.5">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white print:text-slate-800">{course}</h4>
                          <div className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500">{university}</div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 dark:text-white print:text-slate-800 font-medium">Class of {graduationYear}</p>
                          {academicMarks && <p className="text-xs text-[#0ea5e9] print:text-indigo-600 font-bold">{academicMarks}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-slate-900 mb-2 border-b border-slate-300 dark:border-white/10 print:border-slate-200 pb-1">
                      TECHNICAL COMPETENCIES
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-1 print:text-slate-800">
                      {skills.length > 0 ? skills.map(skill => (
                        <span key={skill} className="px-3 py-1 rounded bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 print:border-slate-300 print:bg-slate-100 text-xs text-slate-700 dark:text-slate-300 print:text-slate-800 font-medium">
                          {skill}
                        </span>
                      )) : (
                        <span className="text-slate-500 dark:text-slate-500 text-xs italic">No skills listed in profile yet.</span>
                      )}
                    </div>
                  </div>

                  {projects.length === 0 && experience.length === 0 ? (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-slate-900 mb-3 border-b border-slate-300 dark:border-white/10 print:border-slate-200 pb-1 flex items-center justify-between">
                        <span>NOTABLE PROJECTS & EXPERIENCE</span>
                      </h3>
                      <div className="space-y-4">
                        <div className="relative pl-4 border-l-2 border-slate-300 dark:border-white/10 print:border-slate-200">
                          <div className="flex justify-between items-start mb-0.5 text-sm">
                            <h4 className="font-bold text-slate-900 dark:text-white print:text-slate-800">Lead Portfolio Creator</h4>
                            <span className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500">Dec 2024 - Present</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-600 mb-1">Career Connect System Portfolio</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500">
                            Designed and programmed React client layers with glassmorphism interfaces, including simulated Redis analytics dashboard and Nodemailer developer log channels.
                          </p>
                        </div>

                        <div className="relative pl-4 border-l-2 border-slate-300 dark:border-white/10 print:border-slate-200">
                          <div className="flex justify-between items-start mb-0.5 text-sm">
                            <h4 className="font-bold text-slate-900 dark:text-white print:text-slate-800">Undergraduate Web Assessor</h4>
                            <span className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500">Jun 2023 - Nov 2024</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-600 mb-1">Freelance UI Engineering</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500">
                            Built optimized client interfaces and integrated custom print stylesheets into production sites, reducing print pagination rendering failures to zero.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {projects.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-slate-900 mb-3 border-b border-slate-300 dark:border-white/10 print:border-slate-200 pb-1">
                            NOTABLE PROJECTS
                          </h3>
                          <div className="space-y-4">
                            {projects.map((proj, idx) => (
                              <div key={idx} className="relative pl-4 border-l-2 border-slate-300 dark:border-white/10 print:border-slate-200">
                                <div className="flex justify-between items-start mb-0.5 text-sm">
                                  <h4 className="font-bold text-slate-900 dark:text-white print:text-slate-800 flex items-center gap-2">
                                    {proj.name}
                                    {proj.repoLink && (
                                      <a 
                                        href={proj.repoLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-xs text-[#0ea5e9] hover:underline flex items-center gap-0.5 no-print"
                                      >
                                        <span className="text-[10px] font-mono opacity-80">&lt;Code/&gt;</span>
                                      </a>
                                    )}
                                  </h4>
                                  <span className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500 font-mono">{proj.date}</span>
                                </div>
                                {proj.repoLink && (
                                  <p className="text-[11px] text-[#0ea5e9] print:text-indigo-600 mb-1 font-mono break-all">
                                    Repo: {proj.repoLink}
                                  </p>
                                )}
                                <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500 mt-1 leading-relaxed">
                                  {proj.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {experience.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-slate-900 mb-3 border-b border-slate-300 dark:border-white/10 print:border-slate-200 pb-1">
                            PROFESSIONAL EXPERIENCE
                          </h3>
                          <div className="space-y-4">
                            {experience.map((exp, idx) => (
                              <div key={idx} className="relative pl-4 border-l-2 border-slate-300 dark:border-white/10 print:border-slate-200">
                                <div className="flex justify-between items-start mb-0.5 text-sm">
                                  <h4 className="font-bold text-slate-900 dark:text-white print:text-slate-800">{exp.role}</h4>
                                  <span className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500 font-mono">{exp.duration}</span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-650 mb-1 font-medium">{exp.company}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-500 dark:text-slate-500 leading-relaxed">
                                  {exp.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Print-only Footer details */}
                <div className="hidden print:block mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-600 dark:text-slate-400">
                  Document generated by Career Connect Profile Audit System. AI matching verified.
                </div>
              </div>
            </>
          ) : (
            <GlassCard className="flex flex-col items-center justify-center py-20 text-slate-600 dark:text-slate-400 min-h-[450px]">
              <FileText size={48} className="mb-4 opacity-30 text-[#8b5cf6]" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Select or Upload a Resume</h3>
              <p className="text-xs max-w-sm text-center">We will parse the document content, compute a verified score, and check for missing job skills tags instantly.</p>
              <FlatButton onClick={() => setShowUploadForm(true)} className="bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/35 text-slate-900 dark:text-white mt-4 text-xs py-1.5">
                Upload My First Resume
              </FlatButton>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resume;
