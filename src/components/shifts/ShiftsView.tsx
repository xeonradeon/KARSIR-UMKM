import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/utils/formatters';
import {
  Banknote,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  DollarSign,
} from 'lucide-react';

export const ShiftsView: React.FC = () => {
  const {
    currentShift,
    shifts,
    activeOutlet,
    startShift,
    endShift,
    recordCashMovement,
    showToast,
  } = useApp();

  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [isCashMovementModalOpen, setIsCashMovementModalOpen] = useState(false);

  // Open Shift Form
  const [startingCash, setStartingCash] = useState<number>(100000);

  // Close Shift Form
  const [actualEndingCash, setActualEndingCash] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('');

  // Petty Cash Form
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('OUT');
  const [movementAmount, setMovementAmount] = useState<number>(20000);
  const [movementReason, setMovementReason] = useState<string>('');

  // Expected Cash calculation
  const expectedCash = currentShift
    ? currentShift.startingCash +
      currentShift.totalCashSales +
      (currentShift.cashInExpenses || 0) -
      (currentShift.cashOutExpenses || 0)
    : 0;

  const handleStartShift = () => {
    startShift(startingCash);
    setIsOpenShiftModalOpen(false);
  };

  const handleEndShift = () => {
    if (!currentShift) return;
    endShift(actualEndingCash, closeNotes);
    setIsCloseShiftModalOpen(false);
  };

  const handleSaveMovement = () => {
    if (movementAmount <= 0) {
      showToast('error', 'Nominal kas harus lebih dari 0!');
      return;
    }
    if (!movementReason.trim()) {
      showToast('error', 'Keterangan keperluan kas wajib diisi!');
      return;
    }

    recordCashMovement(movementType, movementAmount, movementReason);
    setIsCashMovementModalOpen(false);
    setMovementReason('');
    showToast(
      'success',
      `Kas ${movementType === 'IN' ? 'Masuk' : 'Keluar'} senilai ${formatRupiah(movementAmount)} berhasil dicatat.`
    );
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-[#1a1d24] dark:text-[#f4f2ec]">
            Shift Kasir & Kontrol Kas Laci
          </h1>
          <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-0.5">
            Manajemen modal awal kasir, petty cash kas masuk/keluar, dan audit tutup shift
          </p>
        </div>

        {currentShift ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCashMovementModalOpen(true)}
              leftIcon={<DollarSign className="h-4 w-4" />}
              className="text-xs"
            >
              Kas Masuk / Keluar (Petty Cash)
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setActualEndingCash(expectedCash);
                setIsCloseShiftModalOpen(true);
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              className="font-bold text-xs"
            >
              Tutup Shift Kasir
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => setIsOpenShiftModalOpen(true)}
            leftIcon={<Unlock className="h-4 w-4" />}
            className="font-bold text-xs"
          >
            Buka Shift Kasir Baru
          </Button>
        )}
      </div>

      {/* ACTIVE SHIFT STATUS BANNER */}
      {currentShift ? (
        <Card className="p-5 sm:p-6 bg-[#1f232b] text-[#f7f6f2] dark:bg-[#181b20] space-y-5 border border-[#3e4757] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3e4757] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#f5f4ef] animate-ping" />
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#a0a8b7]">
                  SHIFT SEDANG BERJALAN
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#f7f6f2]">
                  Kasir: {currentShift.cashierName} ({activeOutlet.name})
                </h3>
              </div>
            </div>
            <div className="text-xs text-[#a0a8b7]">
              Dibuka: <strong className="text-[#f7f6f2]">{formatDateTime(currentShift.startTime)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 rounded-xl bg-[#2b313d] dark:bg-[#20252e]">
              <div className="text-xs text-[#a0a8b7]">Modal Awal Laci</div>
              <div className="text-base sm:text-lg font-black text-[#f7f6f2] mt-1">
                {formatRupiah(currentShift.startingCash)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#2b313d] dark:bg-[#20252e]">
              <div className="text-xs text-[#a0a8b7]">Penjualan Tunai</div>
              <div className="text-base sm:text-lg font-black text-[#f7f6f2] mt-1">
                + {formatRupiah(currentShift.totalCashSales)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#2b313d] dark:bg-[#20252e]">
              <div className="text-xs text-[#a0a8b7]">Pengeluaran Kas</div>
              <div className="text-base sm:text-lg font-black text-[#f7f6f2] mt-1">
                - {formatRupiah(currentShift.cashOutExpenses || 0)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#2b313d] dark:bg-[#20252e]">
              <div className="text-xs text-[#a0a8b7]">Total Uang di Laci</div>
              <div className="text-base sm:text-lg font-black text-[#f7f6f2] mt-1">
                {formatRupiah(expectedCash)}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center bg-[#f7f6f2] dark:bg-[#181b20] border-dashed border-[#dcd7ce] dark:border-[#333b49] space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-[#efece6] dark:bg-[#252b36] text-[#485060] dark:text-[#a0a8b7] flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
              Shift Kasir Sedang Tertutup
            </h3>
            <p className="text-xs text-[#70798a] max-w-md mx-auto mt-1">
              Buka shift kasir terlebih dahulu dengan memasukkan nominal uang modal awal untuk mulai melayani transaksi di POS.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsOpenShiftModalOpen(true)}
            className="font-bold text-xs"
          >
            Buka Shift Sekarang
          </Button>
        </Card>
      )}

      {/* HISTORIC SHIFT LOGS */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
          Riwayat Rekap Shift Kasir
        </h3>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#efece6] dark:bg-[#20252e] border-b border-[#e2ded6] dark:border-[#2e3542] text-[#70798a] uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Kasir</th>
                  <th className="py-3 px-4">Waktu Buka / Tutup</th>
                  <th className="py-3 px-4">Modal Awal</th>
                  <th className="py-3 px-4">Tunai Masuk</th>
                  <th className="py-3 px-4">Kas Keluar</th>
                  <th className="py-3 px-4">Uang Fisik</th>
                  <th className="py-3 px-4">Selisih Kas</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ded6] dark:divide-[#2e3542]">
                {shifts.map((s) => {
                  const diff = s.cashDifference ?? s.difference;
                  return (
                    <tr key={s.id} className="hover:bg-[#efece6]/40 dark:hover:bg-[#20252e]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                        {s.cashierName}
                      </td>
                      <td className="py-3 px-4 text-[#70798a]">
                        <div>Buka: {formatDateTime(s.startTime)}</div>
                        {s.endTime && <div>Tutup: {formatDateTime(s.endTime)}</div>}
                      </td>
                      <td className="py-3 px-4">{formatRupiah(s.startingCash)}</td>
                      <td className="py-3 px-4 font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                        {formatRupiah(s.totalCashSales)}
                      </td>
                      <td className="py-3 px-4 text-[#70798a]">
                        {formatRupiah(s.cashOutExpenses || 0)}
                      </td>
                      <td className="py-3 px-4 font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                        {s.actualEndingCash !== undefined ? formatRupiah(s.actualEndingCash) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {diff !== undefined ? (
                          <span
                            className={`font-bold ${
                              diff === 0
                                ? 'text-[#70798a]'
                                : diff > 0
                                ? 'text-[#1a1d24] dark:text-[#f4f2ec]'
                                : 'text-[#485060] dark:text-[#a0a8b7]'
                            }`}
                          >
                            {diff > 0 ? `+${formatRupiah(diff)}` : formatRupiah(diff)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={s.status === 'OPEN' ? 'primary' : 'default'} size="sm">
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
      </div>

      {/* MODAL: Open Shift */}
      <Modal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        title="Buka Shift Kasir Baru"
        maxWidth="sm"
        footer={
          <Button variant="primary" onClick={handleStartShift} className="w-full font-bold">
            Konfirmasi Buka Shift
          </Button>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0]">
            Masukkan jumlah uang tunai yang tersedia di laci kasir (kembalian awal):
          </p>
          <div>
            <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
              Modal Awal Tunai (Rp)
            </label>
            <input
              type="number"
              value={startingCash}
              onChange={(e) => setStartingCash(Math.max(0, Number(e.target.value)))}
              className="w-full h-11 px-3 text-lg font-black bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl text-[#1a1d24] dark:text-[#f4f2ec]"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: Close Shift */}
      <Modal
        isOpen={isCloseShiftModalOpen}
        onClose={() => setIsCloseShiftModalOpen(false)}
        title="Tutup Shift Kasir & Hitung Fisik Laci"
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCloseShiftModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleEndShift} className="font-bold">
              Tutup Shift & Simpan Laporan
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#f7f6f2] dark:bg-[#20252e] rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>Modal Awal:</span>
              <span className="font-bold text-[#1a1d24] dark:text-[#f4f2ec]">{formatRupiah(currentShift?.startingCash || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Penjualan Tunai:</span>
              <span className="font-bold text-[#1a1d24] dark:text-[#f4f2ec]">+ {formatRupiah(currentShift?.totalCashSales || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pengeluaran Petty Cash:</span>
              <span className="font-bold text-[#1a1d24] dark:text-[#f4f2ec]">- {formatRupiah(currentShift?.cashOutExpenses || 0)}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-2 border-t border-[#e2ded6] dark:border-[#2e3542] text-[#1a1d24] dark:text-[#f4f2ec]">
              <span>Ekspektasi Uang di Laci:</span>
              <span>{formatRupiah(expectedCash)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
              Uang Fisik Dihitung Kasir (Rp) *
            </label>
            <input
              type="number"
              value={actualEndingCash}
              onChange={(e) => setActualEndingCash(Math.max(0, Number(e.target.value)))}
              className="w-full h-11 px-3 text-lg font-black bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl text-[#1a1d24] dark:text-[#f4f2ec]"
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#70798a]">Selisih Uang (Variance):</span>
            <span className="font-black text-sm text-[#1a1d24] dark:text-[#f4f2ec]">
              {formatRupiah(actualEndingCash - expectedCash)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
              Catatan Serah Terima
            </label>
            <input
              type="text"
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="Contoh: Selisih uang koin kembalian Rp 500"
              className="w-full h-10 px-3 bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl text-xs text-[#1a1d24] dark:text-[#f4f2ec]"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: Cash In/Out Movement */}
      <Modal
        isOpen={isCashMovementModalOpen}
        onClose={() => setIsCashMovementModalOpen(false)}
        title="Catat Kas Masuk / Keluar (Petty Cash)"
        maxWidth="sm"
        footer={
          <Button variant="primary" onClick={handleSaveMovement} className="w-full font-bold">
            Simpan Arus Kas
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setMovementType('OUT')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                movementType === 'OUT'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                  : 'border-[#dcd7ce] text-[#485060] dark:border-[#333b49] dark:text-[#a0a8b7]'
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" />
              <span>Kas Keluar (Biaya)</span>
            </button>
            <button
              onClick={() => setMovementType('IN')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                movementType === 'IN'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                  : 'border-[#dcd7ce] text-[#485060] dark:border-[#333b49] dark:text-[#a0a8b7]'
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              <span>Kas Masuk</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
              Nominal (Rp)
            </label>
            <input
              type="number"
              value={movementAmount}
              onChange={(e) => setMovementAmount(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
              Keperluan / Alasan
            </label>
            <input
              type="text"
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
              placeholder="Contoh: Beli es batu kristal 2 pack / Isi galon"
              className="w-full h-10 px-3 bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl text-xs text-[#1a1d24] dark:text-[#f4f2ec]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
