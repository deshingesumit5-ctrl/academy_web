import React from 'react';

interface TopbarProps {
  title: string;
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onToggleSidebar }) => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger-btn" onClick={onToggleSidebar}>
          <i className="ti ti-menu-2"></i>
        </button>
        <h1>{title}</h1>
      </div>
    </div>
  );
};


