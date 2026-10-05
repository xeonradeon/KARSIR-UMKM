'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Outlet, Business, BusinessSettings, Notification, RoleType } from '@/types';
import { SEED_USERS, SEED_OUTLETS, SEED_BUSINESS, SEED_SETTINGS } from '@/lib/db/seed-data';
import { playSuccessSound, playErrorSound } from '@/lib/audio';

export type AppView =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'inventory'
  | 'transactions'
  | 'customers'
  | 'purchases'
  | 'suppliers'
  | 'shifts'
  | 'reports'
  | 'promotions'
  | 'employees'
  | 'outlets'
  | 'audit'
  | 'settings'
  | 'landing';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface AppContextType {
  user: User | null;
  business: Business;
  settings: BusinessSettings;
  activeOutlet: Outlet;
  outlets: Outlet[];
  currentView: AppView;
  darkMode: boolean;
  soundEnabled: boolean;
  notifications: Notification[];
  unreadNotifsCount: number;
  toasts: ToastMessage[];
  setCurrentView: (view: AppView) => void;
  setActiveOutlet: (outlet: Outlet) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  loginAs: (role: RoleType) => void;
  logout: () => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshData: () => Promise<void>;
  updateSettingsState: (settings: Partial<BusinessSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Default to OWNER demo user
  const [user, setUser] = useState<User | null>(SEED_USERS[0]);
  const [business, setBusiness] = useState<Business>(SEED_BUSINESS);
  const [settings, setSettings] = useState<BusinessSettings>(SEED_SETTINGS);
  const [outlets, setOutlets] = useState<Outlet[]>(SEED_OUTLETS);
  const [activeOutlet, setActiveOutlet] = useState<Outlet>(SEED_OUTLETS[0]);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load preferences from localStorage & fetch fresh notifications
  useEffect(() => {
    try {
      const savedDark = localStorage.getItem('pos_dark_mode');
      if (savedDark === 'true') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }

      const savedSound = localStorage.getItem('pos_sound_enabled');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }

      const savedOutletId = localStorage.getItem('pos_active_outlet');
      if (savedOutletId) {
        const found = SEED_OUTLETS.find((o) => o.id === savedOutletId);
        if (found) setActiveOutlet(found);
      }
    } catch {}

    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [notifsRes, settingsRes, outletsRes] = await Promise.all([
        fetch('/api/notifications').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/outlets').then((r) => r.json()),
      ]);

      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data.items || []);
      }
      if (settingsRes.success && settingsRes.data) {
        if (settingsRes.data.business) setBusiness(settingsRes.data.business);
        if (settingsRes.data.settings) setSettings(settingsRes.data.settings);
      }
      if (outletsRes.success && outletsRes.data) {
        setOutlets(outletsRes.data);
      }
    } catch {}
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('pos_dark_mode', String(next));
      } catch {}
      return next;
    });
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pos_sound_enabled', String(next));
      } catch {}
      return next;
    });
  };

  const showToast = (
    first: 'success' | 'error' | 'info' | 'warning' | string,
    second?: string,
    title?: string
  ) => {
    let finalType: 'success' | 'error' | 'info' | 'warning' = 'info';
    let finalMessage = '';
    let finalTitle = title;

    const validTypes = ['success', 'error', 'info', 'warning'];
    if (validTypes.includes(first)) {
      finalType = first as any;
      finalMessage = second || '';
    } else {
      finalMessage = first;
      if (second && validTypes.includes(second)) {
        finalType = second as any;
      }
    }

    const id = `tst_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, type: finalType, title: finalTitle, message: finalMessage };
    setToasts((prev) => [...prev, newToast]);

    if (soundEnabled) {
      if (finalType === 'success') playSuccessSound();
      else if (finalType === 'error') playErrorSound();
    }

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loginAs = (role: RoleType) => {
    const target = SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
    setUser(target);
    showToast('success', `Beralih peran ke: ${target.name} (${target.role})`, 'Peran Diperbarui');
  };

  const logout = () => {
    setUser(null);
    setCurrentView('landing');
    showToast('info', 'Anda telah keluar dari aplikasi.');
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true, outletId: activeOutlet.id }),
      });
    } catch {}
  };

  const updateSettingsState = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSetActiveOutlet = (outlet: Outlet) => {
    setActiveOutlet(outlet);
    try {
      localStorage.setItem('pos_active_outlet', outlet.id);
    } catch {}
    showToast('info', `Cabang aktif: ${outlet.name}`);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        user,
        business,
        settings,
        activeOutlet,
        outlets,
        currentView,
        darkMode,
        soundEnabled,
        notifications,
        unreadNotifsCount,
        toasts,
        setCurrentView,
        setActiveOutlet: handleSetActiveOutlet,
        toggleDarkMode,
        toggleSound,
        loginAs,
        logout,
        showToast,
        removeToast,
        markNotificationRead,
        markAllNotificationsRead,
        refreshData,
        updateSettingsState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
