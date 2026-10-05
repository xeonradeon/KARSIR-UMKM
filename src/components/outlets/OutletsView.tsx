import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Outlet } from '@/types';
import { Building2, Plus, Phone, MapPin, Edit2, Trash2 } from 'lucide-react';

export const OutletsView: React.FC = () => {
  const { outlets, addOutlet, updateOutlet, deleteOutlet, activeOutlet, setActiveOutlet, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxRate, setTaxRate] = useState<number>(0.11);
  const [serviceFeeRate, setServiceFeeRate] = useState<number>(0.05);

  const openCreate = () => {
    setEditingOutlet(null);
    setName('');
    setCode(`CBG-${Math.floor(10 + Math.random() * 90)}`);
    setAddress('');
    setPhone('08');
    setTaxRate(0.11);
    setServiceFeeRate(0.05);
    setIsModalOpen(true);
  };

  const openEdit = (o: Outlet) => {
    setEditingOutlet(o);
    setName(o.name);
    setCode(o.code);
    setAddress(o.address);
    setPhone(o.phone);
    setTaxRate(o.taxRate);
    setServiceFeeRate(o.serviceFeeRate);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !code.trim()) {
      showToast('error', 'Nama dan Kode Cabang wajib diisi!');
      return;
    }

    if (editingOutlet) {
      updateOutlet(editingOutlet.id, {
        name,
        code,
        address,
        phone,
        taxRate,
        serviceFeeRate,
      });
    } else {
      addOutlet({
        name,
        code,
        address,
        phone,
        taxRate,
        serviceFeeRate,
        isMain: false,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus cabang "${name}"?`)) {
      deleteOutlet(id);
    }
  };

  return (
    <div className="p-3 sm:p-5 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fcfbf8] dark:bg-[#181b20] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#e2ded6] dark:border-[#2e3542]">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#3b4251] dark:text-[#a0a8b7]" />
            <h1 className="text-base sm:text-lg font-black text-[#1a1d24] dark:text-[#f4f2ec]">
              Manajemen Multi-Cabang / Outlet
            </h1>
          </div>
          <p className="text-[11px] text-[#70798a] dark:text-[#9aa2b0] mt-0.5">
            Pusat kendali dan pengaturan tarif pajak & layanan per cabang usaha UMKM
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreate}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold text-xs h-9 sm:h-10 shrink-0"
        >
          Tambah Cabang Baru
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {outlets.map((o) => {
          const isActive = activeOutlet.id === o.id;

          return (
            <Card
              key={o.id}
              className={`p-4 space-y-3 transition-all ${
                isActive ? 'border-[#1f232b] dark:border-[#f5f4ef] ring-1 ring-[#1f232b]/20 dark:ring-[#f5f4ef]/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#efece6] text-[#333a47] dark:bg-[#252b36] dark:text-[#dcd9d2]">
                      {o.code}
                    </span>
                    {o.isMain && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#252b36] text-[#f7f6f2] dark:bg-[#e4e1d8] dark:text-[#181b21] font-bold">
                        Pusat
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f4f2ec] mt-1.5">
                    {o.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(o)}
                    className="p-1.5 rounded-lg text-[#70798a] hover:text-[#1a1d24] dark:hover:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36] transition-colors"
                    title="Edit Cabang"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {!o.isMain && outlets.length > 1 && (
                    <button
                      onClick={() => handleDelete(o.id, o.name)}
                      className="p-1.5 rounded-lg text-[#70798a] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Cabang"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#5c6475] dark:text-[#9aa2b0] pt-2 border-t border-[#e2ded6] dark:border-[#2e3542]">
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#70798a] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{o.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#70798a]" />
                  <span>{o.phone}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Pajak PB1:</span>
                  <strong className="text-[#1a1d24] dark:text-[#f4f2ec]">
                    {(o.taxRate * 100).toFixed(0)}%
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan (Service):</span>
                  <strong className="text-[#1a1d24] dark:text-[#f4f2ec]">
                    {(o.serviceFeeRate * 100).toFixed(0)}%
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e2ded6] dark:border-[#2e3542]">
                {isActive ? (
                  <div className="w-full py-1 rounded-lg bg-[#efece6] text-[#1f232b] dark:bg-[#252b36] dark:text-[#f4f2ec] text-xs font-bold text-center">
                    ✓ Cabang Aktif
                  </div>
                ) : (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setActiveOutlet(o);
                      showToast('info', `Beralih ke cabang: ${o.name}`);
                    }}
                    className="w-full font-bold h-8 text-xs"
                  >
                    Beralih ke Cabang Ini
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL: Outlet Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOutlet ? `Edit Cabang: ${editingOutlet.name}` : 'Tambah Cabang Baru'}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} className="font-bold">
              Simpan Data Cabang
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
                Nama Cabang *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Outlet Bandung"
                className="w-full h-9 px-3 bg-[#f7f6f2] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl text-xs text-[#1a1d24] dark:text-[#f4f2ec]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
                Kode Cabang
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CBG-03"
                className="w-full h-9 px-3 bg-[#f7f6f2] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl text-xs font-mono font-bold text-[#1a1d24] dark:text-[#f4f2ec]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
              Alamat Lengkap Cabang
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full p-2 bg-[#f7f6f2] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl text-xs text-[#1a1d24] dark:text-[#f4f2ec]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
              Nomor Telepon Cabang
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-9 px-3 bg-[#f7f6f2] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl text-xs text-[#1a1d24] dark:text-[#f4f2ec]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
                Tarif PB1 (Desimal, misal 0.11)
              </label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full h-9 px-3 bg-[#f7f6f2] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
                Tarif Service Fee (misal 0.05)
              </label>
              <input
                type="number"
                step="0.01"
                value={serviceFeeRate}
                onChange={(e) => setServiceFeeRate(Number(e.target.value))}
                className="w-full h-9 px-3 bg-[#f7f6f2] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
