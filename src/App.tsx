import React from 'react';
import { useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { AssetsView } from './views/AssetsView';
import { WorkOrdersView } from './views/WorkOrdersView';
import { SchedulesView } from './views/SchedulesView';
import { SparePartsView } from './views/SparePartsView';
import { TeamView } from './views/TeamView';
import { ReportsView } from './views/ReportsView';
import { VendorsView } from './views/VendorsView';
import { MenuPermissionsView } from './views/MenuPermissionsView';
import { TeknisiTaskView } from './views/TeknisiTaskView';
import { SupervisorApprovalView } from './views/SupervisorApprovalView';
import { ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, currentView, isMenuAccessibleForRole } = useApp();

  if (!currentUser) {
    return <AuthView />;
  }

  // Check if current view is restricted by admin
  const isAccessible =
    currentView === 'teknisi_tasks' ||
    currentView === 'supervisor_approval' ||
    currentView === 'menu_permissions' ||
    isMenuAccessibleForRole(currentView, currentUser.role);

  const renderView = () => {
    if (!isAccessible) {
      return (
        <div className="industrial-panel p-12 text-center bg-white space-y-3 max-w-lg mx-auto mt-10">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Akses Menu Tidak Diizinkan</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Administrator sistem telah menonaktifkan akses ke modul ini untuk peran{' '}
            <strong className="uppercase">{currentUser.role}</strong>. Silakan hubungi admin atau beralih ke role lain.
          </p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'assets':
        return <AssetsView />;
      case 'work_orders':
        return <WorkOrdersView />;
      case 'schedules':
        return <SchedulesView />;
      case 'spare_parts':
        return <SparePartsView />;
      case 'team':
        return <TeamView />;
      case 'reports':
        return <ReportsView />;
      case 'vendors':
        return <VendorsView />;
      case 'menu_permissions':
        return <MenuPermissionsView />;
      case 'teknisi_tasks':
        return <TeknisiTaskView />;
      case 'supervisor_approval':
        return <SupervisorApprovalView />;
      default:
        return <DashboardView />;
    }
  };

  return <AppLayout>{renderView()}</AppLayout>;
};

export default App;
