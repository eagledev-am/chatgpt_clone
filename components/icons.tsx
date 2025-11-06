
import React from 'react';

export const UserIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export const SparkleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zM18.66 4.34a.75.75 0 01.53 1.28l-2.12 2.12a.75.75 0 01-1.06-1.06l2.12-2.12a.75.75 0 01.53-.22zM21 11.25a.75.75 0 010 1.5h-3a.75.75 0 010-1.5h3zM18.66 18.66a.75.75 0 011.06 1.06l-2.12 2.12a.75.75 0 01-1.06-1.06l2.12-2.12zM12 18a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 18zM5.34 18.66a.75.75 0 01-1.06 1.06l-2.12-2.12a.75.75 0 011.06-1.06l2.12 2.12zM3 12.75a.75.75 0 010-1.5h3a.75.75 0 010 1.5H3zM5.34 5.34a.75.75 0 011.06-1.06l2.12 2.12a.75.75 0 11-1.06 1.06L5.34 5.34z"/>
    <path fillRule="evenodd" d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM9.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" clipRule="evenodd"/>
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
