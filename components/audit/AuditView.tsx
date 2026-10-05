'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/finance';
import { AuditLog } from '@/types';
import { ShieldAlert, Search, RefreshCw, Lock, AlertCircle, FileText } from 'lucide-react';

export const AuditView: React.FC = () => {
  const { showToast } = useApp();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit').then((r) => r.json());
      if (res.success) setLogs(res.data);
    } catch {
      showToast('Gagal memuat log audit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Log Audit & Keamanan Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Rekam jejak setiap aksi krusial (Refund nota, void, penyesuaian stok, buka/tutup shift, login).
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Muat Ulang Log
        </Button>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Cari aksi, nama petugas, atau rincian log..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Petugas / Aktor</th>
                <th className="py-3 px-4">Aksi / Event</th>
                <th className="py-3 px-4">Rincian Perubahan</th>
                <th className="py-3 px-4 text-center">Tingkat Risiko</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Memuat log audit...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada catatan log yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const isHighRisk =
                    log.action.includes('REFUND') ||
                    log.action.includes('DELETE') ||
                    log.action.includes('ADJUST_STOCK');

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {log.userName}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {log.action}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md font-mono text-[11px]">
                        {log.details}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Badge variant={isHighRisk ? 'warning' : 'default'} size="sm">
                          {isHighRisk ? 'Sensitif' : 'Normal'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
