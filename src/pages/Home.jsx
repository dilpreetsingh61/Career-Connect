import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Briefcase, Building2, MousePointer2, Zap, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FlatButton from '../components/ui/FlatButton';
import ParticleBackground from '../components/ui/ParticleBackground';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white dark:bg-[#020617] text-slate-900 dark:text-white overflow-hidden transition-colors duration-200">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ParticleBackground />
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.05),transparent_50%)]"></div>

        {/* Sweeping Light Lines */}
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -rotate-12 blur-sm"></div>
        <div className="absolute top-1/3 -left-1/4 w-[150%] h-[2px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -rotate-12 blur-md"></div>
        <div className="absolute top-2/3 -left-1/4 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -rotate-12 blur-sm"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#0ea5e9] text-sm font-medium mb-8">
              <Sparkles size={14} />
              <span>AI-Powered Career Intelligence</span>
            </div>

            <h1 className="particle-obstacle text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              Build Your Future. <br />
              <motion.span 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400"
              >
                One Smart Step at a Time.
              </motion.span>
            </h1>

            <p className="particle-obstacle text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover your ideal path, craft standout resumes, and land your dream job with a single, intelligent platform designed for your growth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <FlatButton onClick={() => navigate('/auth')} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl text-lg shadow-xl shadow-blue-500/25">
                Start Your Journey <ArrowRight size={20} />
              </FlatButton>
              <button onClick={() => navigate('/explorer')} className="px-8 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
                Explore Careers <ArrowRight size={20} className="text-slate-400 dark:text-white/50" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-4 relative">
          <div className="container mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Find Job Opportunities with Ease</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                Join CareerConnect and start your journey towards a successful career.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={LayoutGrid}
                stat="5000+"
                title="Job Listings"
                description="Explore extensive job opportunities matches to your skills and experiences."
              />
              <FeatureCard
                icon={Building2}
                stat="250+"
                title="Top Companies"
                description="Partnered with leading tech companies and startups globally to provide direct access."
              />
              <FeatureCard
                icon={Sparkles}
                stat="Personalized"
                title="Matches"
                description="Earn personalized job recommendations tailored to your profile."
              />
              <FeatureCard
                icon={CheckCircle2}
                stat="1-Click"
                title="Applications"
                description="Find matches to one click apply, streamline your job search, and apply instantly."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 border-t border-slate-200 dark:border-white/5">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Take Control of Your Career Today</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xl mb-12 max-w-2xl mx-auto">
              Join CareerConnect and start your journey towards a successful career.
            </p>
            <FlatButton onClick={() => navigate('/auth')} className="mx-auto w-fit flex flex-col sm:flex-row items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none rounded-2xl text-xl font-bold shadow-2xl shadow-blue-500/40 px-8 py-4">
              Get Started For Free <ArrowRight size={24} className="ml-2" />
            </FlatButton>
          </div>
        </section>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, stat, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all group"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#0ea5e9] group-hover:bg-blue-500/20 transition-colors">
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stat}</div>
        <div className="text-slate-700 dark:text-slate-300 font-medium">{title}</div>
      </div>
    </div>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
      {description}
    </p>
  </motion.div>
);

export default Home;
