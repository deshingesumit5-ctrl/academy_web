import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Login } from './auth/Login';

import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

import { DashboardPage } from './features/dashboard/DashboardPage';
import { MasterOverviewPage } from './features/master/MasterOverviewPage';
import { AcademyPage } from './features/master/academy/AcademyPage';
import { LibraryPlanPage } from './features/master/library-plan/LibraryPlanPage';
import { CoursePage } from './features/master/course/CoursePage';
import { BatchPage } from './features/master/batch/BatchPage';
import { ExamPage } from './features/master/exam/ExamPage';
import { InquirySourcePage } from './features/master/inquiry-source/InquirySourcePage';
import { FeeStructurePage } from './features/master/fee-structure/FeeStructurePage';
import { EmployeePage } from './features/master/employee/EmployeePage';
import { UserMasterPage } from './features/master/user/UserMasterPage';
import { CastePage } from './features/master/caste/CastePage';
import { ReligionPage } from './features/master/religion/ReligionPage';
import { KitSizePage } from './features/master/kit-size/KitSizePage';


import { RegistrationPage } from './features/registration/RegistrationPage';
import { StudentDetailsPage } from './features/registration/StudentDetailsPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { FeeManagementPage } from './features/fees/FeeManagementPage';
import { MarksheetPage } from './features/marksheet/MarksheetPage';
import { InquiryPage } from './features/inquiry/InquiryPage';
import { FollowupPage } from './features/followup/FollowupPage';
import { WhatsappPage } from './features/whatsapp/WhatsappPage';
import { TaskPage } from './features/tasks/TaskPage';
import { ReportPage } from './features/reports/ReportPage';
import { ReportDetailPage } from './features/reports/ReportDetailPage';

import { RolesPage } from './features/roles/RolesPage';
import { RoleFormPage } from './features/roles/RoleFormPage';
import { prefetchAllData } from './config/prefetch';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/masters': 'Master management',
  '/masters/academy': 'Academy master',
  '/masters/library-plan': 'Library plan master',
  '/masters/course': 'Course master',
  '/masters/batch': 'Batch master',
  '/masters/exam': 'Exam master',
  '/masters/inquiry-source': 'Inquiry source master',
  '/masters/fee-structure': 'Fee structure master',
  '/masters/employee': 'Employee master',
  '/masters/user': 'User master',
  '/masters/caste': 'Caste master',
  '/masters/religion': 'Religion master',
  '/masters/kit-size': 'Kit size master',
  '/masters/blood-group': 'Blood group master',
  '/registration': 'Student registration',
  '/attendance': 'Attendance management',
  '/fees': 'Fee management',
  '/marksheet': 'Marksheet management',
  '/inquiry': 'Inquiry management',
  '/followup': 'Follow-up management',
  '/whatsapp': 'WhatsApp integration',
  '/tasks': 'Task management',
  '/reports': 'Reports & Analytics',
  '/reports/student': 'Student Report',
  '/reports/attendance': 'Attendance Report',
  '/reports/fee': 'Fee Report',
  '/reports/inquiry': 'Inquiry Report',
  '/reports/follow-up': 'Follow-up Report',
  '/reports/task': 'Task Report',
  '/roles': 'Roles & Permissions',
  '/roles/create': 'Create Role',
};

const SuperAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isSuperAdmin } = useAuth();
  if (!isSuperAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    prefetchAllData();

    // Automatically inspect all rendered tables and inject data-label & data-card-number for mobile cards
    const updateTableLabels = () => {
      const tables = document.querySelectorAll('table');
      tables.forEach((table) => {
        const thEls = table.querySelectorAll('thead th');
        if (thEls.length === 0) return;
        const headers = Array.from(thEls).map((th) => th.textContent?.trim() || '');

        const isIdColumnHeader = (header: string) => {
          const norm = header.toLowerCase().replace(/[^a-z0-9#]/g, '');
          return norm === 'id' || norm === '#' || norm === 'srno' || norm === 'sno' || norm === 'slno' || norm === 'serialno' || norm === 'no';
        };

        const idColumnIdx = headers.findIndex(isIdColumnHeader);

        // Detect pagination offset if present in surrounding page container
        let pageOffset = 0;
        const container = table.closest('.card, .page-content, main, body') || table.parentElement;
        if (container) {
          const text = container.textContent || '';
          const showingMatch = text.match(/showing\s+(\d+)\s*(?:to|-)\s*\d+/i);
          if (showingMatch) {
            const startNum = parseInt(showingMatch[1], 10);
            if (!isNaN(startNum) && startNum > 0) {
              pageOffset = startNum - 1;
            }
          }
        }

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td');

          // Inject data-label attributes for mobile card stacked fields
          cells.forEach((cell, idx) => {
            if (headers[idx]) {
              const label = headers[idx];
              if (cell.getAttribute('data-label') !== label) {
                cell.setAttribute('data-label', label);
              }
            }
          });

          // Determine mobile card serial number
          let cardNumber = '';
          if (idColumnIdx !== -1 && cells[idColumnIdx]) {
            const idCell = cells[idColumnIdx];
            if (idCell.getAttribute('data-is-id-col') !== 'true') {
              idCell.setAttribute('data-is-id-col', 'true');
            }
            const val = idCell.textContent?.trim();
            if (val && val !== '-' && val !== '—') {
              cardNumber = val;
            }
          }

          if (!cardNumber) {
            cardNumber = String(pageOffset + rowIndex + 1);
          }

          if (row.getAttribute('data-card-number') !== cardNumber) {
            row.setAttribute('data-card-number', cardNumber);
          }
        });
      });
    };

    updateTableLabels();

    const observer = new MutationObserver(() => {
      updateTableLabels();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  let currentTitle = pageTitles[location.pathname];
  if (!currentTitle && location.pathname.startsWith('/roles/edit')) {
    currentTitle = 'Edit Role';
  }
  if (!currentTitle && location.pathname.startsWith('/reports/')) {
    const reportType = location.pathname.split('/')[2];
    const reportTitles: Record<string, string> = {
      student: 'Student Report',
      attendance: 'Attendance Report',
      fee: 'Fee Report',
      inquiry: 'Inquiry Report',
      'follow-up': 'Follow-up Report',
      task: 'Task Report',
    };
    currentTitle = reportTitles[reportType] || 'Report Detail';
  }
  if (!currentTitle) {
    currentTitle = 'Academy System';
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main">
        <Topbar title={currentTitle} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/masters" element={<MasterOverviewPage />} />
            <Route path="/masters/academy" element={<AcademyPage />} />
            <Route path="/masters/library-plan" element={<LibraryPlanPage />} />
            <Route path="/masters/course" element={<CoursePage />} />
            <Route path="/masters/batch" element={<BatchPage />} />
            <Route path="/masters/exam" element={<ExamPage />} />
            <Route path="/masters/inquiry-source" element={<InquirySourcePage />} />
            <Route path="/masters/fee-structure" element={<FeeStructurePage />} />
            <Route path="/masters/employee" element={<EmployeePage />} />
            <Route path="/masters/user" element={<UserMasterPage />} />
            <Route path="/masters/caste" element={<CastePage />} />
            <Route path="/masters/religion" element={<ReligionPage />} />
            <Route path="/masters/kit-size" element={<KitSizePage />} />

            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/student-details/:id" element={<StudentDetailsPage />} />
            <Route path="/students" element={<Navigate to="/registration" replace />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/fees" element={<FeeManagementPage />} />
            <Route path="/marksheet" element={<MarksheetPage />} />
            <Route path="/inquiry" element={<InquiryPage />} />
            <Route path="/followup" element={<FollowupPage />} />
            <Route path="/whatsapp" element={<WhatsappPage />} />
            <Route path="/tasks" element={<TaskPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/reports/:type" element={<ReportDetailPage />} />

            {/* Super Admin Protected Roles Module */}
            <Route
              path="/roles"
              element={
                <SuperAdminRoute>
                  <RolesPage />
                </SuperAdminRoute>
              }
            />
            <Route
              path="/roles/create"
              element={
                <SuperAdminRoute>
                  <RoleFormPage />
                </SuperAdminRoute>
              }
            />
            <Route
              path="/roles/edit/:id"
              element={
                <SuperAdminRoute>
                  <RoleFormPage />
                </SuperAdminRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<MainLayout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
