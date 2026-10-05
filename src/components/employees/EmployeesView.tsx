import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Role, User } from '@/types';
import { Users, Plus, ShieldCheck, Key, Edit2, Trash2 } from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, outlets, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('CASHIER');
  const [pin, setPin] = useState('1234');
  const [assignedOutletId, setAssignedOutletId] = useState(outlets[0]?.id || '');

  const openCreate = () => {
    setEditingEmp(null);
    setName('');
    setEmail('');
    setRole('CASHIER');
    setPin('1234');
    setAssignedOutletId(outlets[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEdit = (emp: User) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role);
    setPin(emp.pin || '1234');
    setAssignedOutletId(emp.assignedOutletId || outlets[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Nama dan Email karyawan wajib diisi!');
      return;
    }

    if (editingEmp) {
      updateEmployee(editingEmp.id, {
        name,
        email,
        role,
        pin,
        assignedOutletId,
      });
      showToast('success', `Data staff ${name} berhasil diperbarui.`);
    } else {
      addEmployee({
        name,
        email,
        role,
        pin,
        assignedOutletId,
        avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=200&q=80`,
      });
      showToast('success', `Staff ${name} berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (emp: User) => {
    if (confirm(`Hapus akun staff "${emp.name}"?`)) {
      deleteEmployee(emp.id);
      showToast('info', `Staff ${emp.name} telah dihapus.`);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Karyawan & Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola staf kasir, store manager, staf gudang, dan PIN keamanan laci
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreate}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold bg-blue-600 shadow-md shadow-blue-500/25"
        >
          Tambah Staff Baru
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const outletObj = outlets.find((o) => o.id === emp.assignedOutletId);

          return (
            <Card key={emp.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="h-11 w-11 rounded-2xl object-cover ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(emp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span>Peran / Role:</span>
                  <Badge
                    variant={
                      emp.role === 'OWNER'
                        ? 'purple'
                        : emp.role === 'MANAGER'
                        ? 'cyan'
                        : emp.role === 'CASHIER'
                        ? 'success'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {emp.role}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span>Penempatan Outlet:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {outletObj ? outletObj.name : 'Semua Cabang'}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>PIN Otorisasi POS:</span>
                  <span className="font-mono font-bold">••••</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL: Employee Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? `Edit Karyawan: ${editingEmp.name}` : 'Tambah Karyawan Baru'}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSave} className="font-bold">
              Simpan Data Staff
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Staf *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Peran (Role Akses)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="OWNER">Owner (Pemilik Toko)</option>
                <option value="MANAGER">Manager Toko</option>
                <option value="CASHIER">Kasir (Cashier)</option>
                <option value="STAFF_INVENTORY">Staff Gudang</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                PIN Kasir (4-6 Digit)
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Outlet Penempatan
            </label>
            <select
              value={assignedOutletId}
              onChange={(e) => setAssignedOutletId(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
