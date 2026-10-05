'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { User, UserRole } from '@/types';
import { UserCog, Plus, Shield, Check, Lock, Edit2, Trash2 } from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { showToast, loginAs } = useApp();

  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CASHIER');
  const [pin, setPin] = useState('1234');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees').then((r) => r.json());
      if (res.success) setEmployees(res.data);
    } catch {
      showToast('Gagal memuat daftar pegawai.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEmp(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('CASHIER');
    setPin('1234');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: User) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setRole(emp.role);
    setPin('1234');
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Nama dan email wajib diisi!', 'warning');
      return;
    }

    try {
      if (editingEmp) {
        const res = await fetch(`/api/employees/${editingEmp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, role }),
        }).then((r) => r.json());

        if (res.success) {
          showToast('Data pegawai diperbarui!', 'success');
          setIsModalOpen(false);
          fetchEmployees();
        } else {
          showToast(res.message || 'Gagal memperbarui.', 'error');
        }
      } else {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, role, password: pin }),
        }).then((r) => r.json());

        if (res.success) {
          showToast('Pegawai baru berhasil ditambahkan!', 'success');
          setIsModalOpen(false);
          fetchEmployees();
        } else {
          showToast(res.message || 'Gagal menambahkan.', 'error');
        }
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Kelola Pegawai & Hak Akses (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Atur akun kasir, manajer toko, staff gudang, dan hak akses transaksi aman.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Tambah Pegawai Baru
        </Button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <Card className="p-3 bg-purple-50/50 border-purple-200 dark:bg-purple-950/20">
          <div className="font-bold text-purple-700 dark:text-purple-400">👑 OWNER</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Akses total seluruh fitur, laporan finansial, pengaturan usaha, dan audit log.
          </p>
        </Card>

        <Card className="p-3 bg-blue-50/50 border-blue-200 dark:bg-blue-950/20">
          <div className="font-bold text-blue-700 dark:text-blue-400">🛡️ MANAGER</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manajemen produk, stok opname, order PO, diskon, dan otorisasi refund nota.
          </p>
        </Card>

        <Card className="p-3 bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20">
          <div className="font-bold text-emerald-700 dark:text-emerald-400">🛒 CASHIER</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Transaksi kasir POS, barcode scan, struk nota, dan serah terima shift kas.
          </p>
        </Card>

        <Card className="p-3 bg-amber-50/50 border-amber-200 dark:bg-amber-950/20">
          <div className="font-bold text-amber-700 dark:text-amber-400">📦 INVENTORY</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Penerimaan barang dari supplier, stock opname fisik, dan mutasi barang.
          </p>
        </Card>
      </div>

      {/* Employees Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Nama Pegawai</th>
                <th className="py-3 px-4">Email & Kontak</th>
                <th className="py-3 px-4 text-center">Peran (Role)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{emp.name}</div>
                    <div className="text-[10px] text-slate-400">ID: {emp.id}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 dark:text-slate-200">{emp.email}</div>
                    <div className="text-[10px] text-slate-400">{emp.phone || '-'}</div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Badge
                      variant={
                        emp.role === 'OWNER'
                          ? 'info'
                          : emp.role === 'MANAGER'
                          ? 'default'
                          : emp.role === 'CASHIER'
                          ? 'success'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {emp.role}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Badge variant="success" size="sm">
                      Aktif
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        loginAs(emp.role);
                        showToast(`Beralih simulasi peran sebagai ${emp.name} (${emp.role})`, 'info');
                      }}
                    >
                      Simulasi Login
                    </Button>

                    <button
                      onClick={() => openEditModal(emp)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
        size="md"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Lengkap *
            </label>
            <Input
              placeholder="Contoh: Rina Kasir"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Alamat Email *
              </label>
              <Input
                type="email"
                placeholder="rina@toko.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No. Telepon
              </label>
              <Input
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Peran Akun *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="CASHIER">Kasir (POS & Shift)</option>
                <option value="MANAGER">Manager Toko</option>
                <option value="STAFF_INVENTORY">Staff Gudang (Stok)</option>
                <option value="OWNER">Owner (Akses Penuh)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                PIN Kasir / Password
              </label>
              <Input
                type="password"
                placeholder="4 digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Pegawai
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
