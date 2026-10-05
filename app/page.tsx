'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';
import { ToastContainer } from '@/components/ui/ToastContainer';

// View Modules
import { DashboardView } from '@/components/dashboard/DashboardView';
import { PosTerminal } from '@/components/pos/PosTerminal';
import { ProductsView } from '@/components/products/ProductsView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { PurchasesView } from '@/components/purchases/PurchasesView';
import { SuppliersView } from '@/components/suppliers/SuppliersView';
import { TransactionsView } from '@/components/transactions/TransactionsView';
import { ShiftsView } from '@/components/shifts/ShiftsView';
import { CustomersView } from '@/components/customers/CustomersView';
import { ReportsView } from '@/components/reports/ReportsView';
import { PromotionsView } from '@/components/promotions/PromotionsView';
import { EmployeesView } from '@/components/employees/EmployeesView';
import { OutletsView } from '@/components/outlets/OutletsView';
import { AuditView } from '@/components/audit/AuditView';
import { SettingsView } from '@/components/settings/SettingsView';
import { LandingView } from '@/components/landing/LandingView';

const MainAppContent: React.FC = () => {
  const { currentView } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <PosTerminal />;
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
      case 'reports':
        return <ReportsView />;
      case 'promotions':
        return <PromotionsView />;
      case 'employees':
        return <EmployeesView />;
      case 'outlets':
        return <OutletsView />;
      case 'audit':
        return <AuditView />;
      case 'settings':
        return <SettingsView />;
      case 'landing':
        return <LandingView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans">
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          {renderActiveView()}
        </main>
      </div>

      <MobileNav />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function Page() {
  return (
    <AppProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AppProvider>
  );
}
