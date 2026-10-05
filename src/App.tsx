import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';
import { ToastContainer } from '@/components/ui/ToastContainer';

// Views
import { LandingView } from '@/components/landing/LandingView';
import { PosTerminal } from '@/components/pos/PosTerminal';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ProductsView } from '@/components/products/ProductsView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { PurchasesView } from '@/components/purchases/PurchasesView';
import { SuppliersView } from '@/components/suppliers/SuppliersView';
import { TransactionsView } from '@/components/transactions/TransactionsView';
import { ShiftsView } from '@/components/shifts/ShiftsView';
import { CustomersView } from '@/components/customers/CustomersView';
import { PromotionsView } from '@/components/promotions/PromotionsView';
import { ReportsView } from '@/components/reports/ReportsView';
import { EmployeesView } from '@/components/employees/EmployeesView';
import { OutletsView } from '@/components/outlets/OutletsView';
import { AuditView } from '@/components/audit/AuditView';
import { SettingsView } from '@/components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // F9: Quick jump to POS
      if (e.key === 'F9') {
        e.preventDefault();
        setCurrentView('pos');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView]);

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView />;
      case 'pos':
        return <PosTerminal />;
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'inventory':
        return <InventoryView />;
      case 'purchases':
        return <PurchasesView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'transactions':
        return <TransactionsView />;
      case 'shifts':
        return <ShiftsView />;
      case 'customers':
        return <CustomersView />;
      case 'promotions':
        return <PromotionsView />;
      case 'reports':
        return <ReportsView />;
      case 'employees':
        return <EmployeesView />;
      case 'outlets':
        return <OutletsView />;
      case 'audit':
        return <AuditView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f7f6f2] dark:bg-[#14171c] text-[#1a1d24] dark:text-[#f4f2ec] antialiased font-sans">
      {/* Top App Header */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Body: Sidebar + Main Dynamic View Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{renderView()}</main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Quick Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </AppProvider>
  );
}
