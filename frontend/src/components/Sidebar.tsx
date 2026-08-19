import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const isMastersActive = location.pathname.startsWith('/masters');
  const isStudentsActive = ['/registration', '/attendance', '/fees', '/marksheet'].includes(location.pathname);
  const isGrowthActive = ['/inquiry', '/followup'].includes(location.pathname);
  const isOperationsActive = ['/whatsapp', '/tasks', '/reports'].includes(location.pathname);

  const roleLabel =
    user?.role === 'SUPER_ADMIN'
      ? 'Super Admin'
      : user?.role === 'OFFICE_ADMIN'
      ? 'Office Admin'
      : 'Sales User';

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Logo & Name */}
        <div className="brand">
          <div className="brand-icon">
            <i className="ti ti-school"></i>
          </div>
          <div className="brand-info">
            <div className="brand-text">Academy & Library</div>
            <div className="brand-sub">Management system</div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="nav-menu" ref={navMenuRef}>
          {/* Dashboard */}
          <div className="nav-group">
            <div className="nav-section mobile-only">Overview</div>
            <NavLink
              to="/"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => { setOpenDropdown(null); onClose(); }}
            >
              <div className="nav-item-left">
                <i className="ti ti-layout-dashboard mobile-only"></i>
                <span>Dashboard</span>
              </div>
            </NavLink>
          </div>

          {/* Masters Group */}
          <div className={`nav-group dropdown-group ${isMastersActive ? 'active' : ''} ${openDropdown === 'masters' ? 'open' : ''}`}>
            <div className="nav-section mobile-only">Masters</div>
            <div
              className={`nav-item dropdown-trigger desktop-only ${isMastersActive ? 'active' : ''}`}
              onClick={() => toggleDropdown('masters')}
            >
              <div className="nav-item-left">
                <span>Masters</span>
              </div>
              <i className="ti ti-chevron-down dropdown-arrow"></i>
            </div>
            <div className={`dropdown-menu ${openDropdown === 'masters' ? 'show' : ''}`}>
              <NavLink to="/masters/academy" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-building"></i>Academy
              </NavLink>
              <NavLink to="/masters/library-plan" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-books"></i>Library Plan
              </NavLink>
              <NavLink to="/masters/course" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-notebook"></i>Course
              </NavLink>
              <NavLink to="/masters/batch" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-users-group"></i>Batch
              </NavLink>
              <NavLink to="/masters/exam" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-clipboard-text"></i>Exam
              </NavLink>
              <NavLink to="/masters/inquiry-source" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-route"></i>Inquiry Source
              </NavLink>
              <NavLink to="/masters/fee-structure" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-receipt"></i>Fee Structure
              </NavLink>
            </div>
          </div>

          {/* Students Group */}
          <div className={`nav-group dropdown-group ${isStudentsActive ? 'active' : ''} ${openDropdown === 'students' ? 'open' : ''}`}>
            <div className="nav-section mobile-only">Students</div>
            <div
              className={`nav-item dropdown-trigger desktop-only ${isStudentsActive ? 'active' : ''}`}
              onClick={() => toggleDropdown('students')}
            >
              <div className="nav-item-left">
                <span>Students</span>
              </div>
              <i className="ti ti-chevron-down dropdown-arrow"></i>
            </div>
            <div className={`dropdown-menu ${openDropdown === 'students' ? 'show' : ''}`}>
              <NavLink to="/registration" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-user-plus"></i>Student Registration
              </NavLink>
              <NavLink to="/attendance" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-calendar-check"></i>Attendance
              </NavLink>
              <NavLink to="/fees" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-cash"></i>Fee Management
              </NavLink>
              <NavLink to="/marksheet" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-file-certificate"></i>Marksheet
              </NavLink>
            </div>
          </div>

          {/* Growth Group */}
          <div className={`nav-group dropdown-group ${isGrowthActive ? 'active' : ''} ${openDropdown === 'growth' ? 'open' : ''}`}>
            <div className="nav-section mobile-only">Growth</div>
            <div
              className={`nav-item dropdown-trigger desktop-only ${isGrowthActive ? 'active' : ''}`}
              onClick={() => toggleDropdown('growth')}
            >
              <div className="nav-item-left">
                <span>Growth</span>
              </div>
              <i className="ti ti-chevron-down dropdown-arrow"></i>
            </div>
            <div className={`dropdown-menu ${openDropdown === 'growth' ? 'show' : ''}`}>
              <NavLink to="/inquiry" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-phone-call"></i>Inquiry
              </NavLink>
              <NavLink to="/followup" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-calendar-time"></i>Follow-ups
              </NavLink>
            </div>
          </div>

          {/* Operations Group */}
          <div className={`nav-group dropdown-group ${isOperationsActive ? 'active' : ''} ${openDropdown === 'operations' ? 'open' : ''}`}>
            <div className="nav-section mobile-only">Operations</div>
            <div
              className={`nav-item dropdown-trigger desktop-only ${isOperationsActive ? 'active' : ''}`}
              onClick={() => toggleDropdown('operations')}
            >
              <div className="nav-item-left">
                <span>Operations</span>
              </div>
              <i className="ti ti-chevron-down dropdown-arrow"></i>
            </div>
            <div className={`dropdown-menu ${openDropdown === 'operations' ? 'show' : ''}`}>
              <NavLink to="/whatsapp" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-brand-whatsapp"></i>WhatsApp
              </NavLink>
              <NavLink to="/tasks" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-checklist"></i>Tasks
              </NavLink>
              <NavLink to="/reports" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                <i className="ti ti-chart-bar"></i>Reports
              </NavLink>
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="sidebar-footer" ref={userDropdownRef}>
          <button className="sidebar-icon-btn" title="Notifications">
            <i className="ti ti-bell"></i>
          </button>

          <div
            className="sidebar-user-btn"
            onClick={() => setUserDropdownOpen((prev) => !prev)}
            title="User menu"
          >
            {user?.fullName?.substring(0, 2).toUpperCase() || 'SU'}
          </div>

          {userDropdownOpen && (
            <div className="avatar-dropdown">
              <div className="avatar-dropdown-header">
                <div className="user-name">{user?.fullName || roleLabel}</div>
                <div className="user-role">{roleLabel}</div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-logout-btn" onClick={handleLogout}>
                <i className="ti ti-logout"></i>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
