# MTCPRO — Maintenance Management System (MEP)

Sistem Otomasi Pemeliharaan Terpadu Fasilitas *Mechanical, Electrical, dan Plumbing* (MEP) berbasis Web dengan 4 Role Pengguna (**Admin, Teknisi, Supervisor, Manager**) dan Konfigurasi Izin Menu Dinamis.

---

## 🛠️ Fitur Utama

- **1. Halaman Login & Pendaftaran (`/auth`)**: Pendaftaran user baru & 1-Click Demo Login untuk 4 role.
- **2. Halaman Admin**:
  - **01. Dashboard**: KPI Operasional MEP, Matrix Work Order Kritis, Jadwal Terdekat, Tim On-Duty.
  - **02. Pengelolaan Aset**: Inventaris mesin MEP (HVAC, Trafo, Panel MDP, Booster Pump, STP), QR Tag preview.
  - **03. Work Order (WO)**: List View & Kanban Board, pembuatan tiket, penugasan teknisi, tracking checklist.
  - **04. Maintenance Schedule**: Jadwal preventif berkala & tombol Auto-Generate WO.
  - **05. Pengelolaan Spare Part**: Inventaris suku cadang MEP, threshold minimum, modal restok.
  - **06. Team**: Direktori personil & manajemen hak akses (role switcher).
  - **07. Report**: Visualisasi analitik Recharts (Status WO, Proporsi MEP, Tren MTTR & Kepatuhan Preventif), Export Excel & Cetak PDF.
  - **08. Pengelolaan Vendor**: Direktori vendor spesialis MEP, SLA rating, status kontrak.
  - **09. Pengaturan Akses Menu**: Matriks dinamis untuk mengontrol menu yang tampil pada Teknisi, Supervisor, dan Manager.
- **3. Halaman Teknisi**: Menu dinamis & portal *Tugas Saya* (eksekusi checklist lapangan, pemotongan stok spare part otomatis, submit penyelesaian).
- **4. Halaman Supervisor**: Menu dinamis & portal *Verifikasi & Approval WO* (verifikasi hasil kerja teknisi atau minta revisi).
- **5. Halaman Manager**: Menu dinamis & portal *Executive Reliability Index* (kepatuhan preventif, MTTR/MTBF, metrik biaya).

---

## 💻 Menjalankan Proyek Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Build untuk production
npm run build
```

Buka browser pada: `http://localhost:5173/`
