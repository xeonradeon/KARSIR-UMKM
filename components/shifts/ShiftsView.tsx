'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/lib/finance';
import { Shift, Expense } from '@/types';
import {
  Clock,
  DollarSign,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  History,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const ShiftsView: React.FC = () => {
  const { activeOutlet, user, showToast } = useApp();

  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftsHistory, setShiftsHistory] = useState<Shift[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState<number>(200000);

  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [closingCash, setClosingCash] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState('');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState<
    'OPERATIONAL' | 'SUPPLIES' | 'MAINTENANCE' | 'REFUND' | 'OTHER'
  >('SUPPLIES');
  const [expenseDesc, setExpenseDesc] = useState('');

  useEffect(() => {
    fetchShiftData();
  }, [activeOutlet]);

  const fetchShiftData = async () => {
    try {
      setLoading(true);
      const [activeRes, histRes, expRes] = await Promise.all([
        fetch(`/api/shifts?outletId=${activeOutlet.id}&activeOnly=true`).then((r) => r.json()),
        fetch(`/api/shifts?outletId=${activeOutlet.id}`).then((r) => r.json()),
        fetch(`/api/expenses?outletId=${activeOutlet.id}`).then((r) => r.json()),
      ]);

      if (activeRes.success) {
        setActiveShift(activeRes.data);
        if (activeRes.data) {
          const expected =
            activeRes.data.openingCash +
            activeRes.data.cashSales +
            activeRes.data.cashInTotal -
            activeRes.data.cashOutTotal;
          setClosingCash(expected);
        }
      } else {
        setActiveShift(null);
      }

      if (histRes.success) setShiftsHistory(histRes.data);
      if (expRes.success) setExpenses(expRes.data);
    } catch {
      showToast('Gagal memuat data shift kasir.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: activeOutlet.id,
          userId: user?.id || 'usr_cashier',
          userName: user?.name || 'Kasir',
          openingCash,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast('Shift kasir berhasil dibuka!', 'success');
        setIsOpenShiftModalOpen(false);
        fetchShiftData();
      } else {
        showToast(res.message || 'Gagal membuka shift.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi.', 'error');
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    try {
      const res = await fetch(`/api/shifts/${activeShift.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingCash,
          notes: closeNotes,
          userId: user?.id,
          userName: user?.name,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast('Shift kasir berhasil ditutup dan laporan dicatat!', 'success');
        setIsCloseShiftModalOpen(false);
        setCloseNotes('');
        fetchShiftData();
      } else {
        showToast(res.message || 'Gagal menutup shift.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi.', 'error');
    }
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0 || !expenseDesc.trim()) {
      showToast('Harap isi nominal dan keperluan pengeluaran!', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: activeOutlet.id,
          shiftId: activeShift?.id,
          amount: expenseAmount,
          category: expenseCategory,
          description: expenseDesc,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast('Pengeluaran kas kecil berhasil dicatat!', 'success');
        setIsExpenseModalOpen(false);
        setExpenseAmount(0);
        setExpenseDesc('');
        fetchShiftData();
      } else {
        showToast(res.message || 'Gagal mencatat pengeluaran.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  const currentExpectedCash = activeShift
    ? activeShift.openingCash +
      activeShift.cashSales +
      activeShift.cashInTotal -
      activeShift.cashOutTotal
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Shift Kasir & Kas Laci (Cash Drawer)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola modal awal kasir, catat pengeluaran kas kecil (petty cash), dan rekonsiliasi selisih kas saat tutup buku.
          </p>
        </div>

        <div>
          {activeShift ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsCloseShiftModalOpen(true)}
              leftIcon={<Lock className="h-4 w-4" />}
            >
              Tutup Shift Kasir
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpenShiftModalOpen(true)}
              leftIcon={<Unlock className="h-4 w-4" />}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Buka Shift Baru
            </Button>
          )}
        </div>
      </div>

      {/* ACTIVE SHIFT STATUS BANNER */}
      {activeShift ? (
        <Card className="p-6 bg-linear-to-br from-blue-500/5 via-transparent to-emerald-500/5 border-blue-200 dark:border-blue-900 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Shift Sedang Berjalan
                  </h3>
                  <Badge variant="success" size="sm">
                    AKTIF
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Petugas Kasir: <strong className="text-slate-800 dark:text-slate-200">{activeShift.userName}</strong> • Dibuka sejak {formatDateTime(activeShift.openedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpenseModalOpen(true)}
                leftIcon={<MinusCircle className="h-4 w-4 text-rose-500" />}
              >
                Catat Kas Keluar / Biaya
              </Button>
            </div>
          </div>

          {/* Cash Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Modal Awal Kas</span>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                {formatRupiah(activeShift.openingCash)}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">Penjualan Tunai (Cash)</span>
              <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                +{formatRupiah(activeShift.cashSales)}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-rose-500 uppercase">Pengeluaran Kas Kecil</span>
              <div className="text-base font-bold text-rose-500 font-mono mt-0.5">
                -{formatRupiah(activeShift.cashOutTotal)}
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase">Total Kas Laci Seharusnya</span>
              <div className="text-lg font-black text-blue-700 dark:text-blue-300 font-mono mt-0.5">
                {formatRupiah(currentExpectedCash)}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center space-y-3 bg-amber-50/40 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Tidak Ada Shift Kasir yang Aktif Saat Ini
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Buka shift kasir terlebih dahulu untuk memasukkan modal uang kembalian dan mulai transaksi kasir POS dengan pencatatan rapi.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsOpenShiftModalOpen(true)}
            leftIcon={<Unlock className="h-4 w-4" />}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Buka Shift Kasir Sekarang
          </Button>
        </Card>
      )}

      {/* SHIFTS HISTORY TABLE */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Riwayat Tutup Shift & Rekonsiliasi Kas
          </h3>
          <span className="text-xs text-slate-400">{shiftsHistory.length} catatan shift</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Kasir & Waktu</th>
                <th className="py-3 px-4 text-right">Modal Awal</th>
                <th className="py-3 px-4 text-right">Penjualan Tunai</th>
                <th className="py-3 px-4 text-right">Kas Diharapkan</th>
                <th className="py-3 px-4 text-right">Kas Fisik Aktual</th>
                <th className="py-3 px-4 text-center">Selisih Kas</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {shiftsHistory.map((s) => {
                const diff = s.difference || 0;
                const hasDiff = Math.abs(diff) > 0;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {s.userName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateTime(s.openedAt)}
                        {s.closedAt && ` - ${new Date(s.closedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {formatRupiah(s.openingCash)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-semibold">
                      +{formatRupiah(s.cashSales)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {s.expectedCash ? formatRupiah(s.expectedCash) : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {s.closingCash ? formatRupiah(s.closingCash) : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {s.status === 'CLOSED' ? (
                        hasDiff ? (
                          <Badge variant={diff < 0 ? 'error' : 'warning'} size="sm">
                            {diff > 0 ? `+${formatRupiah(diff)}` : formatRupiah(diff)}
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Pas (Rp 0)
                          </Badge>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400">Sedang Berjalan</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={s.status === 'OPEN' ? 'info' : 'default'} size="sm">
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* OPEN SHIFT MODAL */}
      <Modal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        title="Buka Shift Kasir Baru"
        size="sm"
      >
        <form onSubmit={handleOpenShift} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Petugas Kasir
            </label>
            <Input value={user?.name || 'Kasir'} disabled />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Modal Awal Kas Laci (Uang Kembalian) *
            </label>
            <Input
              type="number"
              min={0}
              value={openingCash}
              onChange={(e) => setOpeningCash(Number(e.target.value))}
              placeholder="Contoh: 200000"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Masukkan nominal uang fisik pecahan kembalian yang ada di laci saat mulai buka toko.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsOpenShiftModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Mulai Shift Kasir
            </Button>
          </div>
        </form>
      </Modal>

      {/* CLOSE SHIFT MODAL */}
      <Modal
        isOpen={isCloseShiftModalOpen}
        onClose={() => setIsCloseShiftModalOpen(false)}
        title="Tutup Shift & Rekonsiliasi Kas"
        size="md"
      >
        <form onSubmit={handleCloseShift} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Modal Awal:</span>
              <span className="font-mono">{activeShift && formatRupiah(activeShift.openingCash)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Penjualan Tunai Shift Ini:</span>
              <span className="font-mono">{activeShift && formatRupiah(activeShift.cashSales)}</span>
            </div>
            <div className="flex justify-between text-rose-500">
              <span>Pengeluaran Kas Kecil:</span>
              <span className="font-mono">-{activeShift && formatRupiah(activeShift.cashOutTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Uang Kas Diharapkan (Expected):</span>
              <span className="font-mono text-blue-600">{formatRupiah(currentExpectedCash)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Hitung & Masukkan Uang Fisik Aktual di Laci (Closing Cash) *
            </label>
            <Input
              type="number"
              value={closingCash}
              onChange={(e) => setClosingCash(Number(e.target.value))}
              required
            />
            {closingCash !== currentExpectedCash && (
              <div className={`text-xs font-bold mt-1.5 ${closingCash > currentExpectedCash ? 'text-emerald-600' : 'text-rose-600'}`}>
                Selisih Kas: {closingCash > currentExpectedCash ? `Kelebihan +${formatRupiah(closingCash - currentExpectedCash)}` : `Kekurangan ${formatRupiah(closingCash - currentExpectedCash)}`}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan Serah Terima Shift
            </label>
            <Input
              placeholder="Contoh: Kas diserahkan ke shift sore, laci bersih"
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsCloseShiftModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Konfirmasi & Tutup Shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* RECORD EXPENSE MODAL */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Catat Pengeluaran Kas Kecil (Petty Cash)"
        size="sm"
      >
        <form onSubmit={handleRecordExpense} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kategori Biaya</label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="SUPPLIES">Perlengkapan / Bahan Baku Darurat (Es, Plastik, Gas)</option>
              <option value="OPERATIONAL">Operasional Toko / Konsumsi</option>
              <option value="MAINTENANCE">Perbaikan & Kebersihan</option>
              <option value="REFUND">Pengembalian Dana Manual</option>
              <option value="OTHER">Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nomor / Jumlah Pengeluaran (Rp) *
            </label>
            <Input
              type="number"
              min={1000}
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(Number(e.target.value))}
              placeholder="Contoh: 35000"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Keperluan / Keterangan *
            </label>
            <Input
              placeholder="Contoh: Beli es batu kristal 2 bungkus"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsExpenseModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Pengeluaran
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
