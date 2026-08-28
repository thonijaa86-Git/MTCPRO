import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { workOrders, assets, schedules, spareParts, showToast } = useApp();
  const [timeRange, setTimeRange] = useState('Bulan Ini (Agustus 2026)');

  // Calculate Data for Charts
  const statusCounts = [
    { name: 'Open', count: workOrders.filter((w) => w.status === 'Open').length, fill: '#3b82f6' },
    { name: 'Proses', count: workOrders.filter((w) => w.status === 'Proses').length, fill: '#f59e0b' },
    { name: 'Pending', count: workOrders.filter((w) => w.status === 'Pending').length, fill: '#64748b' },
    { name: 'Selesai', count: workOrders.filter((w) => w.status === 'Selesai').length, fill: '#10b981' },
    { name: 'Disetujui', count: workOrders.filter((w) => w.status === 'Disetujui').length, fill: '#0d9488' }
  ];

  const categoryDistribution = [
    { name: 'Mechanical', value: workOrders.filter((w) => w.category === 'Mechanical').length, color: '#0284c7' },
    { name: 'Electrical', value: workOrders.filter((w) => w.category === 'Electrical').length, color: '#eab308' },
    { name: 'Plumbing', value: workOrders.filter((w) => w.category === 'Plumbing').length, color: '#059669' }
  ];

  const monthlyComplianceTrend = [
    { month: 'Apr', pmRate: 91, mttrHours: 4.8 },
    { month: 'Mei', pmRate: 94, mttrHours: 4.2 },
    { month: 'Jun', pmRate: 92, mttrHours: 3.9 },
    { month: 'Jul', pmRate: 97, mttrHours: 3.5 },
    { month: 'Agu', pmRate: 98, mttrHours: 3.2 }
  ];

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    showToast('success', 'Export Excel Berhasil', 'Laporan performa pemeliharaan MEP telah diunduh (MTCPRO_Report_2026.xlsx)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Laporan & Analitik Performa Pemeliharaan MEP</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan / PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="industrial-panel p-4 bg-white border-l-4 border-l-blue-600">
          <span className="text-[11px] uppercase font-bold text-slate-500">Preventive Compliance</span>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">98.2%</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">↑ +1.2% dari bulan lalu</p>
        </div>

        <div className="industrial-panel p-4 bg-white border-l-4 border-l-emerald-600">
          <span className="text-[11px] uppercase font-bold text-slate-500">MTTR (Rata2 Waktu Perbaikan)</span>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">3.2 Jam</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">↓ Lebih cepat 0.3 jam</p>
        </div>

        <div className="industrial-panel p-4 bg-white border-l-4 border-l-amber-500">
          <span className="text-[11px] uppercase font-bold text-slate-500">MTBF (Rata2 Waktu Antar Rusak)</span>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">740 Jam</h3>
          <p className="text-xs text-blue-600 font-semibold mt-1">Indeks reliabilitas tinggi</p>
        </div>

        <div className="industrial-panel p-4 bg-white border-l-4 border-l-purple-600">
          <span className="text-[11px] uppercase font-bold text-slate-500">Total Work Order Selesai</span>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {workOrders.filter((w) => w.status === 'Selesai' || w.status === 'Disetujui').length} WO
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Dari total {workOrders.length} WO terbit</p>
        </div>
      </div>

      {/* Charts Row 1: Status Distribution & Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: WO per Status (7 Cols) */}
        <div className="lg:col-span-7 industrial-panel p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribusi Status Work Order (WO)
              </h3>
              <p className="text-xs text-slate-500">Jumlah tiket perbaikan per tahapan pengerjaan</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Live Data
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Bar dataKey="count" name="Jumlah WO" radius={[4, 4, 0, 0]}>
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: MEP Breakdown (5 Cols) */}
        <div className="lg:col-span-5 industrial-panel p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Porsi Beban Kategori MEP
              </h3>
              <p className="text-xs text-slate-500">Proporsi pekerjaan Mechanical vs Electrical vs Plumbing</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Trend MTTR & PM Rate */}
      <div className="industrial-panel p-5 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tren Kepatuhan Preventive Maintenance (%) & Penurunan Durasi MTTR (Jam)
            </h3>
            <p className="text-xs text-slate-500">Histori 5 bulan terakhir pemeliharaan fasilitas</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyComplianceTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[80, 100]} tick={{ fontSize: 11 }} unit="%" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 8]} tick={{ fontSize: 11 }} unit=" Jam" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pmRate"
                name="Kepatuhan Preventif (%)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="mttrHours"
                name="MTTR (Jam Perbaikan)"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
