import React from 'react';

const Footer = () => {
  return (
    <footer className="relative z-10 bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-white/5 pt-16 pb-8 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">CareerConnect</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered platform helping you build your future, one smart step at a time.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-6">CareerConnect</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Dashboard</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Explore</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Jobs</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Resume</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Prep</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Support</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-[#0ea5e9] text-sm transition-colors">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2 text-wrap">
                <span className="text-[#0ea5e9]">✉</span> contact@careerconnect.com
              </li>
              <li className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                <span className="text-[#0ea5e9]">📞</span> +1 (800) 123-4567
              </li>
              <li className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                <span className="text-[#0ea5e9]">📍</span> 123 Tech Avenue, NY
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:row items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} CareerConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500 dark:text-slate-500 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
