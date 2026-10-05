'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Outlet } from '@/types';
import { Store, Plus, MapPin, Phone, CheckCircle2, ArrowRight } from 'lucide-react';

export const OutletsView: React.FC = () => {
  const { outlets, activeOutlet, setActiveOutlet, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showToast('Nama cabang dan kode wajib diisi!', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/outlets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, address, phone }),
      }).then((r) => r.json());

      if (res.success) {
        showToast('Cabang baru berhasil didaftarkan!', 'success');
        setIsModalOpen(false);
        window.location.reload();
      } else {
        showToast(res.message || 'Gagal menambahkan cabang.', 'error');
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
            Multi-Outlet & Cabang Toko
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pusat kendali seluruh cabang bisnis UMKM, inventori terpisah, dan laporan konsolidasi.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setCode(`CBG-0${outlets.length + 1}`);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Tambah Cabang Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.map((o) => {
          const isActive = o.id === activeOutlet.id;

          return (
            <Card
              key={o.id}
              className={`p-6 space-y-4 transition-all relative overflow-hidden ${
                isActive
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'hover:border-slate-300'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider">
                  OUTLET AKTIF
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{o.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">Kode: {o.code}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{o.address || 'Belum ada alamat'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{o.phone || '-'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {isActive ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Sedang Digunakan di Perangkat Ini</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setActiveOutlet(o);
                      showToast(`Beralih ke outlet "${o.name}"`, 'success');
                    }}
                  >
                    Beralih ke Cabang Ini
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* CREATE OUTLET MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Cabang Outlet Baru"
        size="md"
      >
        <form onSubmit={handleAddOutlet} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Cabang *
            </label>
            <Input
              placeholder="Contoh: Cabang Dago Bandung"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kode Cabang *
              </label>
              <Input
                placeholder="CBG-02"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Telepon Toko
              </label>
              <Input
                placeholder="022-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Alamat Lengkap Cabang
            </label>
            <Input
              placeholder="Jl. Ir. H. Juanda No. 88, Bandung"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Cabang Baru
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
