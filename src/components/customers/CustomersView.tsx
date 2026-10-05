import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/utils/formatters';
import { Customer, CustomerTier } from '@/types';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Award,
  CreditCard,
  History,
  Edit2,
  DollarSign,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    payCustomerDebt,
    transactions,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState<number>(0);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [tier, setTier] = useState<CustomerTier>('BRONZE');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery]);

  const openCreate = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('08');
    setEmail('');
    setAddress('');
    setTier('BRONZE');
    setIsCreateModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setTier(c.tier);
    setIsCreateModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      showToast('error', 'Nama dan Nomor HP wajib diisi!');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
        tier,
      });
      showToast('success', `Data pelanggan ${name} diperbarui.`);
    } else {
      addCustomer({
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
        points: 0,
        tier,
        totalSpent: 0,
        receivableDebt: 0,
      });
      showToast('success', `Pelanggan baru ${name} berhasil didaftarkan.`);
    }

    setIsCreateModalOpen(false);
  };

  const handlePayDebt = () => {
    if (!selectedCustomer) return;
    if (debtPaymentAmount <= 0) {
      showToast('error', 'Nominal bayar harus lebih dari 0!');
      return;
    }

    payCustomerDebt(selectedCustomer.id, debtPaymentAmount);
    setIsPayDebtModalOpen(false);
    showToast(
      'success',
      `Pembayaran kasbon senilai ${formatRupiah(debtPaymentAmount)} berhasil dicatat.`
    );
  };

  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter((t) => t.customerId === selectedCustomer.id);
  }, [transactions, selectedCustomer]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Pelanggan & CRM Member
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Loyalty program tier membership, poin belanja, dan catatan kasbon / piutang pelanggan
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreate}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold bg-blue-600 shadow-md shadow-blue-500/25"
        >
          Daftar Member Baru
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari member berdasarkan nama, nomor WhatsApp, email..."
          className="w-full h-10 pl-9 pr-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <Card key={c.id} className="p-5 space-y-4 hover:border-blue-400 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</h3>
                  <Badge
                    variant={
                      c.tier === 'PLATINUM'
                        ? 'purple'
                        : c.tier === 'GOLD'
                        ? 'warning'
                        : c.tier === 'SILVER'
                        ? 'cyan'
                        : 'default'
                    }
                    size="sm"
                  >
                    {c.tier}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{c.phone}</span>
                </div>
              </div>

              <button
                onClick={() => openEdit(c)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Poin Member</div>
                <div className="font-black text-blue-600 mt-0.5">{c.points}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Total Belanja</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {formatRupiah(c.totalSpent)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Hutang Kasbon</div>
                <div className="font-bold text-rose-600 mt-0.5 truncate">
                  {formatRupiah(c.receivableDebt)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <Button
                size="xs"
                variant="outline"
                onClick={() => setSelectedCustomer(c)}
                leftIcon={<History className="h-3 w-3" />}
              >
                Riwayat Belanja
              </Button>

              {c.receivableDebt > 0 && (
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => {
                    setSelectedCustomer(c);
                    setDebtPaymentAmount(c.receivableDebt);
                    setIsPayDebtModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  Bayar Kasbon
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL: Add / Edit Member */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingCustomer ? `Edit Member: ${editingCustomer.name}` : 'Daftar Member Baru'}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSave} className="font-bold">
              Simpan Data Member
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Pelanggan *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / HP *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tier Membership
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CustomerTier)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="PLATINUM">Platinum</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email (Opsional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: Customer Purchase History */}
      {selectedCustomer && !isPayDebtModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCustomer(null)}
          title={`Riwayat Belanja: ${selectedCustomer.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedCustomer.name} ({selectedCustomer.tier})
                </span>
                <div className="text-[10px] text-slate-400">
                  Total Belanja: {formatRupiah(selectedCustomer.totalSpent)} | Poin: {selectedCustomer.points}
                </div>
              </div>
              <Badge variant="warning">{selectedCustomer.points} Poin</Badge>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customerTransactions.length === 0 ? (
                <p className="text-center py-4 text-slate-400">Belum ada riwayat transaksi tercatat.</p>
              ) : (
                customerTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-bold font-mono text-blue-600">{t.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400">{formatDateTime(t.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 dark:text-slate-100">
                        {formatRupiah(t.total)}
                      </div>
                      <div className="text-[10px] text-slate-400">{t.payment.method}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Pay Kasbon */}
      {isPayDebtModalOpen && selectedCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setIsPayDebtModalOpen(false)}
          title={`Pelunasan Kasbon: ${selectedCustomer.name}`}
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPayDebtModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" onClick={handlePayDebt} className="bg-emerald-600 font-bold">
                Konfirmasi Pelunasan
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl">
              Sisa Total Kasbon / Hutang: <strong>{formatRupiah(selectedCustomer.receivableDebt)}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Bayar Pelunasan (Rp)
              </label>
              <input
                type="number"
                value={debtPaymentAmount}
                onChange={(e) => setDebtPaymentAmount(Math.max(0, Number(e.target.value)))}
                className="w-full h-11 px-3 text-base font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
