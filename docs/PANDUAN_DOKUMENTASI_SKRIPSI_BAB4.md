# Panduan Dokumentasi Skripsi - Bab 4 (Hasil dan Implementasi)
## Metodologi Prototype - Sistem Manajemen Laboratorium (Absensi, Aset, Peminjaman, Bahan, dan Fitur Lainnya)

_Catatan: Dokumen ini membahas keseluruhan web aplikasi manajemen laboratorium — bukan hanya sistem absensi. Modul yang didokumentasikan meliputi Absensi (RFID), Manajemen Aset, Peminjaman Aset, Manajemen Bahan, Dashboard & Analytics, Integrasi Telegram, serta fitur pendukung lain seperti laporan, export, dan konfigurasi._

---

## 📋 PENEMPATAN DOKUMENTASI VISUAL

### 1️⃣ ANALISIS KEBUTUHAN
**Tampilkan:**
- ✅ **ERD (Entity Relationship Diagram)**
  - Tabel Users (dengan field RFID, role, telegram_chat_id)
  - Tabel Attendances (check_in, check_out, status)
  - Tabel Schedules / Penjadwalan (jadwal_piket, periode, assigned_user_id)
  - Tabel AsetAslab
  - Tabel PeminjamanAset
  - Tabel Bahan
  - Tabel PenggunaanBahan
  - Tabel Reports / Exports (opsional)
  - Relasi antar tabel (1:N, N:M)

- ✅ **Use Case Diagram**
  - Actor: Admin
  - Actor: User/Aslab
  - Actor: Inventory Manager / Lab Staff
  - Actor: RFID Scanner / Hardware
  - Use cases: Login, Register, Scan RFID, Manage Users, Manage Assets, Pinjam/Kembalikan Aset, Kelola Bahan, Lihat Dashboard, Generate Report

---

### 2️⃣ PEMBUATAN PROTOTYPE
**Tampilkan:**
- ✅ **UI Wireframe/Mockup** (Low-Fidelity)
  - Halaman Login
  - Dashboard
  - Halaman Penjadwalan Piket (otomatis & manual)
  - Attendance Scanner
  - User Management
  - Asset Management (CRUD + Stock Overview)
  - Peminjaman Aset (Form & History)
  - Material Usage (Form & History)
  - Report/Export Page

- ✅ **Class Diagram**
  - Model User
  - Model Attendance
  - Model AsetAslab
  - Model PeminjamanAset
  - Model Bahan
  - Model Schedule / Penjadwalan
  - Model Report (opsional)
  - Controller utama (AuthController, AttendanceController, UserController, AsetAslabController)
  - Service (TelegramService, AttendanceService, InventoryService)

- ✅ **Sequence Diagram** (Pilih 2-4 flow penting)
  1. Flow Login Authentication
  2. Flow RFID Scan → Validation → Create Attendance → Telegram Notification
  3. Flow Peminjaman Aset → Approve → Update Stock
  4. Flow Asset Checkout / Return
  5. Flow Penjadwalan Piket Otomatis → Assign User → Notify via Telegram

---

### 3️⃣ EVALUASI PROTOTYPE → IMPLEMENTASI
**Tampilkan:**
- ✅ **UI Screenshots** (High-Fidelity - Hasil Implementasi)
  - Login/Register Page
  - Dashboard dengan charts (attendance + inventory)
  - Attendance Scanner Interface
  - User Management (CRUD)
  - Asset Management (CRUD, stock details)
  - Peminjaman Aset (Form & History)
  - Material Usage screens
  - Report/Export Page
  - Penjadwalan Piket (view jadwal, hasil penjadwalan otomatis, override manual)

- ✅ **Activity Diagram**
  - Business Process: Proses Absensi Harian
  - Business Process: Peminjaman Aset (Pinjam → Setujui → Kembalikan)
  - Business Process: Penggunaan Bahan (Pakai → Kurangi Stok → Laporan)
  - Business Process: Penjadwalan Piket Otomatis (generate → assign → notify → confirm)

- ✅ **Component Diagram**
  - Frontend (React + Inertia.js)
  - Backend (Laravel)
  - Database (MySQL)
  - External Service (Telegram Bot)
  - RFID Hardware Integration
  - Optional: Background Worker / Queue (Redis/Queue Worker)

---

### 4️⃣ PENGUJIAN & EVALUASI SISTEM
**Tampilkan:**
- ✅ **Screenshot Testing dengan Evidence**
  - Test Case Execution untuk modul utama (Absensi, Aset, Peminjaman, Bahan)
  - Expected vs Actual Result
  - Success/Failure Status dan catatan perbaikan
  - Test Case Execution untuk modul Penjadwalan (algoritma pembagian tugas, override manual, notif)

- ✅ **Deployment Diagram**
  - Server Architecture
  - Docker Container Setup
  - Database Server
  - Web Server (Nginx/Apache)
  - Application Flow

---

## 🎯 FITUR YANG WAJIB DIDOKUMENTASIKAN LENGKAP

### ✅ FITUR UTAMA (WAJIB LENGKAP: UI + UML)

#### 1. **Authentication System**
- **UI:** Login Page, Register Page
- **UML:** 
  - Sequence Diagram: Login Flow
  - Class Diagram: User Model, AuthController
- **Lokasi File:**
  - `resources/js/pages/auth/login.tsx`
  - `app/Http/Controllers/Auth/AuthController.php`

#### 2. **User Management (Kelola User)**
- **UI:** List User, Create User, Edit User, Delete User
- **UML:**
  - Class Diagram: User Model, Role, Permissions
  - Sequence Diagram: CRUD User Flow
- **Lokasi File:**
  - `resources/js/pages/kelola-user/`
  - `app/Http/Controllers/UserController.php`

#### 3. **RFID Attendance System** ⭐ (FITUR INTI)
- **UI:** 
  - Attendance Scanner Interface
  - Real-time Attendance Status
  - History Attendance
- **UML:**
  - Sequence Diagram: RFID Scan → Validation → Create Attendance → Telegram Notification
  - Activity Diagram: Complete Attendance Process
  - Class Diagram: Attendance Model, RFID Integration
- **Lokasi File:**
  - `resources/js/pages/attendance-scan.tsx`
  - `app/Http/Controllers/AttendanceController.php`
  - `app/Services/AttendanceService.php`
  - `test_rfid_api.php`

#### 4. **Automated Duty Scheduling (Penjadwalan Piket Otomatis)**
- **UI:**
  - Halaman Penjadwalan: konfigurasi aturan, periode, override manual
  - Tampilan Kalender / List Jadwal
- **UML:**
  - Sequence Diagram: Generate Schedule → Assign Users → Notify Assigned Users
  - Activity Diagram: Penjadwalan Otomatis (generate → assign → notify → confirm)
  - Class Diagram: Schedule Model, ScheduleService, ScheduleController
- **Lokasi File:**
  - `resources/js/pages/scheduling/` (mis. schedule.tsx)
  - `app/Http/Controllers/ScheduleController.php`
  - `app/Services/ScheduleService.php`
  - `app/Models/Schedule.php`

#### 5. **Dashboard & Analytics**

#### 4. **Dashboard & Analytics**
- **UI:** 
  - Dashboard dengan charts (attendance statistics)
  - Real-time data visualization
- **UML:**
  - Component Diagram: Real-time Update Architecture
  - Class Diagram: Dashboard Components
- **Lokasi File:**
  - `resources/js/pages/dashboard.tsx`
  - `app/Http/Controllers/DashboardController.php`

#### 5. **Telegram Integration** ⭐ (FITUR UNIK)
- **UI:** 
  - Notification Settings
  - Webhook Configuration
- **UML:**
  - Sequence Diagram: Attendance Event → Queue Job → Telegram API → Send Notification
  - Component Diagram: External Service Integration
- **Lokasi File:**
  - `app/Services/TelegramService.php`
  - `app/Jobs/SendTelegramNotification.php`
  - `test_telegram_service.php`

---

## 📦 FITUR PENDUKUNG (CUKUP UI + PENJELASAN SINGKAT)

### ✅ FITUR SEKUNDER (UI Saja, UML Opsional)

#### 1. **Asset Management (Aset Aslab)**
- **UI:** CRUD Interface saja
- **UML:** Cukup masuk dalam ERD dan Class Diagram general
- **Lokasi File:**
  - `resources/js/pages/aset-aslab/`
  - `app/Http/Controllers/AsetAslabController.php`

#### 2. **Material Management (Bahan)**
- **UI:** CRUD Interface saja
- **UML:** Cukup masuk dalam ERD
- **Lokasi File:**
  - `resources/js/pages/bahan/`
  - `app/Models/Bahan.php`

#### 3. **Peminjaman Aset**
- **UI:** Form Peminjaman, History
- **UML:** Cukup Activity Diagram sederhana
- **Lokasi File:**
  - `resources/js/pages/peminjaman-aset/`

#### 4. **Penggunaan Bahan**
- **UI:** Form Penggunaan, History
- **UML:** Cukup Activity Diagram sederhana

---

## ❌ FITUR YANG TIDAK PERLU UML TERPISAH

### Fitur Kecil/Utility (Cukup Disebutkan dalam Teks)

1. **Export Excel/PDF**
   - ❌ Tidak perlu Sequence Diagram terpisah
   - ✅ Cukup disebutkan sebagai fitur dalam Activity Diagram fitur utama
   - ✅ Screenshot UI button export saja

2. **Download Report**
   - ❌ Tidak perlu UML terpisah
   - ✅ Masuk dalam Activity Diagram Report Management

3. **Filter & Search**
   - ❌ Tidak perlu UML terpisah
   - ✅ Disebutkan sebagai supporting feature

4. **Pagination**
   - ❌ Tidak perlu dokumentasi terpisah
   - ✅ Terlihat di screenshot UI saja

---

## 📐 TEMPLATE ERD LENGKAP

```
┌─────────────────────┐
│       USERS         │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email               │
│ password            │
│ rfid_tag            │◄────┐
│ role                │     │
│ telegram_chat_id    │     │
│ created_at          │     │
│ updated_at          │     │
└─────────────────────┘     │
         │                  │
         │ 1:N              │
         ▼                  │
┌─────────────────────┐     │
│    ATTENDANCES      │     │
├─────────────────────┤     │
│ id (PK)             │     │
│ user_id (FK) ───────┼─────┘
│ rfid_tag            │
│ check_in            │
│ check_out           │
│ status              │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────┐
│    ASET_ASLAB       │
├─────────────────────┤
│ id (PK)             │
│ nama_aset           │
│ jumlah              │
│ kondisi             │
│ created_at          │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│ PEMINJAMAN_ASET     │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ aset_id (FK)        │
│ tanggal_pinjam      │
│ tanggal_kembali     │
│ status              │
└─────────────────────┘

┌─────────────────────┐
│       BAHAN         │
├─────────────────────┤
│ id (PK)             │
│ nama_bahan          │
│ stok                │
│ satuan              │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│ PENGGUNAAN_BAHAN    │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ bahan_id (FK)       │
│ jumlah_digunakan    │
│ tanggal_penggunaan  │
└─────────────────────┘
```

---

## 💡 TIPS PENTING UNTUK BAB 4

### ✅ DO (Lakukan)
1. **Fokus pada fitur CORE dan UNIQUE:**
   - RFID Attendance System (ini yang bikin skripsi menarik!)
   - Real-time Telegram Notification
   - Dashboard dengan real-time analytics

2. **Screenshot harus berkualitas:**
   - Gunakan data dummy yang realistis
   - Capture full screen atau specific area yang jelas
   - Beri caption/keterangan pada setiap screenshot

3. **UML harus readable:**
   - Jangan terlalu kompleks dalam satu diagram
   - Gunakan warna untuk membedakan komponen
   - Font harus terbaca jelas

4. **Konsisten dengan tools:**
   - Pilih 1 tool untuk semua UML (contoh: draw.io, Lucidchart, StarUML)
   - Gunakan style yang sama untuk semua diagram

### ❌ DON'T (Jangan)
1. ❌ Jangan dokumentasikan SEMUA fitur dengan detail yang sama
2. ❌ Jangan buat diagram yang terlalu kompleks dan sulit dibaca
3. ❌ Jangan berlebihan dengan fitur kecil seperti export/download
4. ❌ Jangan copy-paste diagram dari internet tanpa modifikasi

---

## 📊 CHECKLIST DOKUMENTASI

### Tahap Analisis Kebutuhan
- [ ] ERD lengkap dengan semua tabel
- [ ] Use Case Diagram dengan semua actor
- [ ] Functional Requirements list
- [ ] Non-Functional Requirements list

### Tahap Pembuatan Prototype
- [ ] Wireframe: Login Page
- [ ] Wireframe: Dashboard
- [ ] Wireframe: Attendance Scanner
- [ ] Wireframe: User Management
- [ ] Class Diagram: Core Models
- [ ] Sequence Diagram: RFID Attendance Flow
- [ ] Sequence Diagram: Login Flow

### Tahap Implementasi
- [ ] Screenshot: Login/Register (implemented)
- [ ] Screenshot: Dashboard dengan data
- [ ] Screenshot: RFID Scanner Interface
- [ ] Screenshot: User Management CRUD
- [ ] Screenshot: Asset Management
- [ ] Screenshot: Report/Export
- [ ] Activity Diagram: Proses Absensi
- [ ] Component Diagram: System Architecture

### Tahap Pengujian
- [ ] Test Case Document
- [ ] Test Execution Evidence (screenshots)
- [ ] Test Result Summary
- [ ] Bug Report (jika ada)
- [ ] Deployment Diagram

---

## 🎯 PRIORITAS DOKUMENTASI

### 🔴 PRIORITAS TINGGI (Wajib Detail)
1. RFID Attendance System (UI + UML + Activity Diagram)
2. Authentication System (UI + Sequence Diagram)
3. Dashboard & Analytics (UI + Component Diagram)
4. Telegram Integration (Sequence Diagram + Component Diagram)
5. ERD Lengkap

### 🟡 PRIORITAS SEDANG (UI + Penjelasan)
1. User Management (UI + Class Diagram)
2. Asset Management (UI saja)
3. Material Management (UI saja)
4. Automated Duty Scheduling / Penjadwalan Piket (UI + Sequence/Activity Diagram)

### 🟢 PRIORITAS RENDAH (Sebutkan Saja)
1. Export/Download Features
2. Filter & Search
3. Pagination
4. Settings/Configuration

---

## 📝 CATATAN TAMBAHAN

### Keunggulan Sistem (Highlight di Skripsi)
1. ✨ **Real-time RFID Attendance** - otomatis tanpa input manual
2. ✨ **Telegram Integration** - notifikasi instant ke user
3. ✨ **Queue System** - untuk handle concurrent requests
4. ✨ **Webhook Integration** - untuk real-time updates
5. ✨ **Docker Deployment** - easy to deploy and scale

### File Penting untuk Evidence
- `test_rfid_api.php` - Testing RFID integration
- `test_telegram_service.php` - Testing Telegram bot
- `debug_attendance.php` - Debugging attendance flow
- `DOKUMENTASI_PENGUJIAN.md` - Test documentation
- `docker-compose.yml` - Deployment configuration

---

## 🔗 REFERENSI FILE PENTING

### Frontend (React + Inertia.js)
- `resources/js/pages/dashboard.tsx` - Dashboard
- `resources/js/pages/attendance-scan.tsx` - RFID Scanner
- `resources/js/pages/kelola-user/` - User Management
- `resources/js/pages/auth/` - Authentication Pages

### Backend (Laravel)
- `app/Http/Controllers/AttendanceController.php` - Main attendance logic
- `app/Services/TelegramService.php` - Telegram integration
- `app/Services/AttendanceService.php` - Business logic
- `app/Models/Attendance.php` - Attendance model
- `app/Jobs/SendTelegramNotification.php` - Queue jobs

### Testing
- `test_rfid_api.php` - RFID testing
- `test_telegram_service.php` - Telegram testing
- `DOKUMENTASI_PENGUJIAN.md` - Test documentation

### Configuration
- `docker-compose.yml` - Docker setup
- `config/services.php` - External services config
- `.env.example` - Environment variables

---

**Terakhir diupdate:** 15 Desember 2025

**Catatan:** Dokumen ini adalah panduan untuk mempermudah penyusunan Bab 4 skripsi dengan metodologi prototype. Sesuaikan dengan kebutuhan dan saran dosen pembimbing.
