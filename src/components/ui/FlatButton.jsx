import React from 'react';
import { motion } from 'framer-motion';

const FlatButton = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 border";
  
  const variants = {
    primary: "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20 hover:border-[#0ea5e9]/50",
    secondary: "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/50",
    success: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/20 hover:border-[#10b981]/50",
    outline: "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </motion.button>
  );
};

export default FlatButton;
