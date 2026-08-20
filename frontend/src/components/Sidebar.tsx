import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axiosInstance from '../config/axiosInstance';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasPermission, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadTaskCount, setUnreadTaskCount] = useState<number>(0);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  const checkUnreadTasks = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get('/tasks');
      const allTasks: any[] = res.data.data || [];
      const userFull = (user.fullName || '').trim().toLowerCase();
      const userEmail = (user.username || '').trim().toLowerCase();

      const myTasks = isSuperAdmin()
        ? allTasks
        : allTasks.filter((t) => {
            const assigned = (t.assignedTo || '').trim().toLowerCase();
            return (userFull && assigned === userFull) || (userEmail && assigned === userEmail);
          });

      const key = `seen_tasks_${user.username || 'user'}`;
      const seenIds: number[] = JSON.parse(localStorage.getItem(key) || '[]');

      const unread = myTasks.filter((t) => !seenIds.includes(t.taskId));
      setUnreadTaskCount(unread.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkUnreadTasks();
    const handleRead = () => checkUnreadTasks();
    window.addEventListener('tasks_read', handleRead);
    const interval = setInterval(checkUnreadTasks, 15000);
    return () => {
      window.removeEventListener('tasks_read', handleRead);
      clearInterval(interval);
    };
  }, [user]);

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
  const isAdminActive = location.pathname.startsWith('/roles');

  const showSuperAdminMenu = isSuperAdmin();

  // Permission checks per sub-item
  const showDashboard = isSuperAdmin() || hasPermission('Dashboard', 'Read') || !!user;
  
  const showAcademy = isSuperAdmin() || hasPermission('Academy Master', 'Read');
  const showLibraryPlan = isSuperAdmin() || hasPermission('Library Plan', 'Read');
  const showCourse = isSuperAdmin() || hasPermission('Course Master', 'Read');
  const showBatch = isSuperAdmin() || hasPermission('Batch Master', 'Read');
  const showExam = isSuperAdmin() || hasPermission('Exam Master', 'Read');
  const showInquirySource = isSuperAdmin() || hasPermission('Inquiry Source', 'Read');
  const showFeeStructure = isSuperAdmin() || hasPermission('Fee Structure', 'Read');
  const showEmployee = isSuperAdmin() || hasPermission('Employee Master', 'Read') || hasPermission('Employee', 'Read');
  const showUserMaster = isSuperAdmin() || hasPermission('User Master', 'Read') || hasPermission('User', 'Read');
  const showBloodGroup = isSuperAdmin() || hasPermission('Blood Group Master', 'Read') || hasPermission('Blood Group', 'Read');
  const showMastersGroup = showAcademy || showLibraryPlan || showCourse || showBatch || showExam || showInquirySource || showFeeStructure || showEmployee || showUserMaster || showBloodGroup;

  const showRegistration = isSuperAdmin() || hasPermission('Student Registration', 'Read');
  const showAttendance = isSuperAdmin() || hasPermission('Attendance', 'Read');
  const showFees = isSuperAdmin() || hasPermission('Fee Management', 'Read');
  const showMarksheet = isSuperAdmin() || hasPermission('Marksheet', 'Read');
  const showStudentsGroup = showRegistration || showAttendance || showFees || showMarksheet;

  const showInquiry = isSuperAdmin() || hasPermission('Inquiry', 'Read');
  const showFollowup = isSuperAdmin() || hasPermission('Follow-ups', 'Read');
  const showGrowthGroup = showInquiry || showFollowup;

  const showWhatsapp = isSuperAdmin() || hasPermission('WhatsApp', 'Read');
  const showTasks = isSuperAdmin() || hasPermission('Tasks', 'Read');
  const showReports = isSuperAdmin() || hasPermission('Reports', 'Read');
  const showOperationsGroup = showWhatsapp || showTasks || showReports;

  const getUserSymbol = () => {
    if (!user) return 'SA';
    const roleUpper = (user.role || '').toUpperCase();
    const nameUpper = (user.fullName || '').toUpperCase();

    if (
      roleUpper.includes('SYSTEM') ||
      roleUpper.includes('SUPER') ||
      nameUpper.includes('SYSTEM ADMIN') ||
      nameUpper.includes('SUPER ADMIN')
    ) {
      return 'SA';
    }
    if (roleUpper.includes('OFFICE') || nameUpper.includes('OFFICE ADMIN')) {
      return 'OA';
    }

    if (user.role) {
      const parts = user.role.trim().split(/\s+/);
      if (parts.length >= 2) {
        const sym = (parts[0][0] + parts[1][0]).toUpperCase();
        if (sym === 'SU') return 'SA';
        return sym;
      }
    }

    if (user.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        const sym = (parts[0][0] + parts[1][0]).toUpperCase();
        if (sym === 'SU') return 'SA';
        return sym;
      }
      const fn = user.fullName.substring(0, 2).toUpperCase();
      return fn === 'SU' ? 'SA' : fn;
    }

    return 'SA';
  };

  const roleLabel = user?.role || (isSuperAdmin() ? 'Super Admin' : 'User');

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
          {showDashboard && (
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
          )}

          {/* Masters Group */}
          {showMastersGroup && (
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
                {showEmployee && (
                  <NavLink to="/masters/employee" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-id"></i>Employee
                  </NavLink>
                )}
                {showUserMaster && (
                  <NavLink to="/masters/user" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-user-cog"></i>User
                  </NavLink>
                )}
                {showAcademy && (
                  <NavLink to="/masters/academy" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-building"></i>Academy
                  </NavLink>
                )}
                {showLibraryPlan && (
                  <NavLink to="/masters/library-plan" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-books"></i>Library Plan
                  </NavLink>
                )}
                {showCourse && (
                  <NavLink to="/masters/course" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-notebook"></i>Course
                  </NavLink>
                )}
                {showBatch && (
                  <NavLink to="/masters/batch" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-users-group"></i>Batch
                  </NavLink>
                )}
                {showExam && (
                  <NavLink to="/masters/exam" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-clipboard-text"></i>Exam
                  </NavLink>
                )}
                {showInquirySource && (
                  <NavLink to="/masters/inquiry-source" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-route"></i>Inquiry Source
                  </NavLink>
                )}
                {showFeeStructure && (
                  <NavLink to="/masters/fee-structure" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-receipt"></i>Fee Structure
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* Students Group */}
          {showStudentsGroup && (
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
                {showRegistration && (
                  <NavLink to="/registration" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-user-plus"></i>Student Registration
                  </NavLink>
                )}
                {showAttendance && (
                  <NavLink to="/attendance" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-calendar-check"></i>Attendance 
                  </NavLink>
                )}
                {showFees && (
                  <NavLink to="/fees" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-cash"></i>Fee Management
                  </NavLink>
                )}
                {showMarksheet && (
                  <NavLink to="/marksheet" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-file-certificate"></i>Marksheet
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* Growth Group */}
          {showGrowthGroup && (
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
                {showInquiry && (
                  <NavLink to="/inquiry" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-phone-call"></i>Inquiry
                  </NavLink>
                )}
                {showFollowup && (
                  <NavLink to="/followup" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-calendar-time"></i>Follow-ups
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* Operations Group */}
          {showOperationsGroup && (
            <div className={`nav-group dropdown-group ${isOperationsActive ? 'active' : ''} ${openDropdown === 'operations' ? 'open' : ''}`}>
              <div className="nav-section mobile-only">Operations</div>
              <div
                className={`nav-item dropdown-trigger desktop-only ${isOperationsActive ? 'active' : ''}`}
                onClick={() => toggleDropdown('operations')}
              >
                <div className="nav-item-left">
                  <span>Operations {unreadTaskCount > 0 && `(${unreadTaskCount})`}</span>
                </div>
                <i className="ti ti-chevron-down dropdown-arrow"></i>
              </div>
              <div className={`dropdown-menu ${openDropdown === 'operations' ? 'show' : ''}`}>
                {showWhatsapp && (
                  <NavLink to="/whatsapp" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-brand-whatsapp"></i>WhatsApp
                  </NavLink>
                )}
                {showTasks && (
                  <NavLink to="/tasks" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-checklist"></i>Task Management {unreadTaskCount > 0 && `(${unreadTaskCount})`}
                  </NavLink>
                )}
                {showReports && (
                  <NavLink to="/reports" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                    <i className="ti ti-chart-bar"></i>Reports
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* Administration Group (Only Super Admin) */}
          {showSuperAdminMenu && (
            <div className={`nav-group dropdown-group ${isAdminActive ? 'active' : ''} ${openDropdown === 'admin' ? 'open' : ''}`}>
              <div className="nav-section mobile-only">Administration</div>
              <div
                className={`nav-item dropdown-trigger desktop-only ${isAdminActive ? 'active' : ''}`}
                onClick={() => toggleDropdown('admin')}
              >
                <div className="nav-item-left">
                  <span>Administration</span>
                </div>
                <i className="ti ti-chevron-down dropdown-arrow"></i>
              </div>
              <div className={`dropdown-menu ${openDropdown === 'admin' ? 'show' : ''}`}>
                <NavLink to="/roles" className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`} onClick={() => { setOpenDropdown(null); onClose(); }}>
                  <i className="ti ti-user-shield"></i>Roles & Permissions
                </NavLink>
              </div>
            </div>
          )}
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
            {getUserSymbol()}
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
