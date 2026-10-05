'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { formatRupiah, formatDateTime } from '@/lib/finance';
import { Customer, Transaction } from '@/types';
import {
  Users,
  Plus,
  Search,
  Award,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Receipt,
  Gift,
  Coins,
  ChevronRight,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { showToast } = useApp();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(
    null
  );
  const [customerTransactions, setCustomerTransactions] = useState<Transaction[]>([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers').then((r) => r.json());
      if (res.success) setCustomers(res.data);
    } catch {
      showToast('Gagal memuat data pelanggan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setIsFormModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama pelanggan wajib diisi!', 'warning');
      return;
    }

    try {
      if (editingCustomer) {
        const res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, address, notes }),
        }).then((r) => r.json());

        if (res.success) {
          showToast('Data pelanggan berhasil diperbarui!', 'success');
          setIsFormModalOpen(false);
          fetchCustomers();
        } else {
          showToast(res.message || 'Gagal memperbarui data.', 'error');
        }
      } else {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, address, notes }),
        }).then((r) => r.json());

        if (res.success) {
          showToast('Pelanggan baru berhasil ditambahkan!', 'success');
          setIsFormModalOpen(false);
          fetchCustomers();
        } else {
          showToast(res.message || 'Gagal menambahkan pelanggan.', 'error');
        }
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  const openCustomerHistory = async (customer: Customer) => {
    setSelectedCustomerForHistory(customer);
    setIsHistoryDrawerOpen(true);
    try {
      const res = await fetch(`/api/transactions?customerId=${customer.id}`).then((r) => r.json());
      if (res.success) setCustomerTransactions(res.data);
    } catch {}
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Pelanggan & Program Loyalitas (CRM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data member, riwayat belanja, poin hadiah, dan peringkat membership.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Tambah Pelanggan
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs font-bold text-slate-500">Total Member Terdaftar</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {customers.length}
          </div>
        </Card>

        <Card className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200">
          <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Tier Gold & Platinum
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {customers.filter((c) => c.tier === 'GOLD' || c.tier === 'PLATINUM').length}
          </div>
        </Card>

        <Card className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border-blue-200">
          <div className="text-xs font-bold text-blue-700 dark:text-blue-400">
            Total Poin Beredar
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {customers.reduce((s, c) => s + c.points, 0).toLocaleString('id-ID')} pts
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Total Belanja Member
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {formatRupiah(customers.reduce((s, c) => s + c.totalSpend, 0))}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Cari nama pelanggan, nomor telepon, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">Semua Tier Loyalitas</option>
            <option value="PLATINUM">💎 Platinum (&gt; Rp 2.000.000)</option>
            <option value="GOLD">🥇 Gold (&gt; Rp 1.000.000)</option>
            <option value="SILVER">🥈 Silver (&gt; Rp 300.000)</option>
            <option value="BRONZE">🥉 Bronze (Pelanggan Baru)</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4 text-center">Tier Loyalitas</th>
                <th className="py-3 px-4 text-center">Poin Poin</th>
                <th className="py-3 px-4 text-right">Total Belanja</th>
                <th className="py-3 px-4 text-center">Frekuensi Kunjungan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data pelanggan yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                      {c.address && (
                        <div className="text-[11px] text-slate-400 line-clamp-1">{c.address}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-300">{c.phone || '-'}</div>
                      {c.email && <div className="text-[11px] text-slate-400">{c.email}</div>}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          c.tier === 'PLATINUM'
                            ? 'info'
                            : c.tier === 'GOLD'
                            ? 'warning'
                            : c.tier === 'SILVER'
                            ? 'default'
                            : 'default'
                        }
                        size="sm"
                      >
                        {c.tier}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                      {c.points} pts
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatRupiah(c.totalSpend)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      {c.totalVisits} kali
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openCustomerHistory(c)}
                        title="Lihat Riwayat Belanja"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(c)}
                        title="Edit Data Pelanggan"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT CUSTOMER MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
        size="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Lengkap *
            </label>
            <Input
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No. WhatsApp / Telepon
              </label>
              <Input
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
              <Input
                type="email"
                placeholder="budi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alamat</label>
            <Input
              placeholder="Alamat rumah / domisili"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan Khusus
            </label>
            <Input
              placeholder="Contoh: Langganan kopi gula aren"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingCustomer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CUSTOMER HISTORY DRAWER */}
      <Drawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        title={`Riwayat Belanja: ${selectedCustomerForHistory?.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Poin Hadiah:</span>
              <strong className="text-blue-600 font-mono">
                {selectedCustomerForHistory?.points} pts
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-slate-500">Total Akumulasi Belanja:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono">
                {selectedCustomerForHistory && formatRupiah(selectedCustomerForHistory.totalSpend)}
              </strong>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar Struk Transaksi ({customerTransactions.length})
            </h4>

            {customerTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Belum ada transaksi tercatat untuk pelanggan ini.
              </p>
            ) : (
              customerTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-blue-600">{tx.invoiceNumber}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatRupiah(tx.grandTotal)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>{formatDateTime(tx.createdAt)}</span>
                    <Badge variant="success" size="sm">
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    {tx.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
