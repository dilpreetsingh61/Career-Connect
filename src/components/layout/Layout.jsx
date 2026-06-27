import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      <Topbar />
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
