# Manual Pengguna - Sistem Absensi Aslab

## Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Persyaratan Sistem](#persyaratan-sistem)
3. [Instalasi dan Setup](#instalasi-dan-setup)
4. [Panduan Login](#panduan-login)
5. [Fitur Dashboard](#fitur-dashboard)
6. [Manajemen Absensi](#manajemen-absensi)
7. [Manajemen Pengguna](#manajemen-pengguna)
8. [Manajemen Aset Laboratorium](#manajemen-aset-laboratorium)
9. [Manajemen Bahan](#manajemen-bahan)
10. [Jadwal Piket](#jadwal-piket)
11. [Sistem RFID](#sistem-rfid)
12. [Notifikasi](#notifikasi)
13. [API Documentation](#api-documentation)
14. [Troubleshooting](#troubleshooting)
15. [FAQ](#faq)

---

## Gambaran Umum

Sistem Absensi Aslab adalah aplikasi web yang dirancang khusus untuk mengelola absensi asisten laboratorium (aslab) di lingkungan akademik. Sistem ini menyediakan fitur-fitur lengkap untuk:

- **Pencatatan Absensi**: Manual dan otomatis menggunakan RFID
- **Manajemen Pengguna**: Admin, Aslab, Mahasiswa, dan Dosen
- **Manajemen Aset**: Inventaris peralatan laboratorium
- **Manajemen Bahan**: Tracking penggunaan bahan laboratorium
- **Jadwal Piket**: Penjadwalan otomatis dan manual
- **Dashboard Analytics**: Statistik dan laporan real-time

### Teknologi yang Digunakan
- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 dengan TypeScript
- **UI Framework**: Inertia.js
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **Real-time**: Laravel Reverb (WebSocket)

---

## Persyaratan Sistem

### Server Requirements
- **PHP**: 8.2 atau lebih tinggi
- **Node.js**: 18.0 atau lebih tinggi
- **Database**: MySQL 8.0+ atau PostgreSQL 13+
- **Web Server**: Apache 2.4+ atau Nginx 1.18+
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 5GB free space

### Browser Requirements
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Hardware RFID (Opsional)
- **RFID Reader**: Compatible dengan protokol HTTP/REST API
- **RFID Cards**: 13.56MHz atau 125kHz

---

## Instalasi dan Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/absensi_aslab_react.git
cd absensi_aslab_react
```

### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup
```bash
# Configure database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=absensi_aslab
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed
```

### 5. Storage Setup
```bash
# Create storage link
php artisan storage:link

# Set permissions (Linux/Mac)
chmod -R 775 storage bootstrap/cache
```

### 6. Build Assets
```bash
# Development build
npm run dev

# Production build
npm run build
```

### 7. Start Development Server
```bash
# Laravel development server
php artisan serve

# Or using composer script
composer run dev
```

### 8. Queue Setup (Optional)
```bash
# Start queue worker
php artisan queue:work

# For development, use in separate terminal
```

---

## Panduan Login

### 1. Akses Sistem
1. Buka browser dan navigasi ke URL aplikasi
2. Anda akan diarahkan ke halaman login

### 2. Login Pengguna
1. **Masukkan Email**: Email yang terdaftar di sistem
2. **Masukkan Password**: Password yang telah ditentukan
3. **Klik "Masuk"**: Sistem akan memverifikasi kredensial

### 3. Login Pertama Kali
Jika Anda belum memiliki akun:
1. Klik "Daftar" pada halaman login
2. Isi formulir pendaftaran:
   - Nama lengkap
   - Email akademik
   - Password
   - Konfirmasi password
   - Program studi
   - Semester
3. Klik "Daftar"
4. Tunggu approval dari admin

### 4. Reset Password
Jika lupa password:
1. Klik "Lupa Password?" pada halaman login
2. Masukkan email Anda
3. Cek email untuk link reset password
4. Ikuti instruksi di email

### 5. Default Accounts (Setelah Seeding)
```
Admin:
Email: admin@example.com
Password: password

Aslab:
Email: aslab@example.com  
Password: password
```

---

## Fitur Dashboard

### 1. Dashboard Overview
Dashboard menyediakan ringkasan informasi penting:

#### Statistik Utama
- **Total Aslab**: Jumlah asisten laboratorium aktif
- **Hadir Hari Ini**: Jumlah aslab yang sudah absen hari ini  
- **Total Aset**: Jumlah aset laboratorium
- **Peminjaman Aktif**: Jumlah peminjaman yang sedang berlangsung

#### Grafik dan Chart
- **Weekly Attendance Chart**: Grafik kehadiran mingguan
- **Monthly Statistics**: Statistik bulanan
- **Attendance Trends**: Tren kehadiran

#### Quick Actions
- **Scan RFID**: Akses cepat untuk scan RFID
- **Manual Attendance**: Input absensi manual
- **View Reports**: Lihat laporan
- **Manage Users**: Kelola pengguna (admin only)

### 2. Real-time Updates
Dashboard menggunakan WebSocket untuk update real-time:
- Notifikasi absensi baru
- Update statistik otomatis
- Alert sistem

### 3. Responsiveness
Dashboard responsive dan dapat diakses dari:
- Desktop computer
- Tablet
- Smartphone

---

## Manajemen Absensi

### 1. Scan RFID (Untuk Admin/Aslab)

#### Cara Menggunakan:
1. **Akses Menu**: Dashboard → "Scan RFID"
2. **Siapkan RFID Reader**: Pastikan perangkat terhubung
3. **Scan Kartu**: Tempelkan kartu RFID ke reader
4. **Verifikasi**: Sistem akan menampilkan informasi pengguna
5. **Konfirmasi**: Klik "Catat Absensi" untuk menyimpan

#### Status Absensi:
- **Check In**: Absensi masuk (pagi hari)
- **Check Out**: Absensi keluar (sore hari)
- **Already Checked In**: Sudah absen masuk hari ini
- **Already Checked Out**: Sudah absen keluar hari ini

### 2. Absensi Manual (Untuk Admin/Aslab)

#### Langkah-langkah:
1. **Akses Menu**: Dashboard → "Absen Manual"
2. **Pilih Pengguna**: Cari dan pilih nama aslab
3. **Pilih Jenis**: Check in atau check out
4. **Tambah Catatan**: Opsional, tambahkan keterangan
5. **Simpan**: Klik "Catat Absensi"

#### Kasus Penggunaan:
- RFID card hilang/rusak
- Sistem RFID bermasalah
- Absensi luar kantor
- Koreksi absensi

### 3. History Absensi

#### Melihat Riwayat:
1. **Akses Menu**: Dashboard → "Riwayat Absensi"
2. **Filter Data**:
   - Tanggal: Pilih rentang tanggal
   - Pengguna: Filter berdasarkan nama
   - Jenis: Check in/out
   - Status: Hadir/tidak hadir
3. **Export Data**: Unduh laporan dalam format Excel/PDF

#### Informasi yang Ditampilkan:
- Nama pengguna
- Tanggal dan waktu
- Jenis absensi (check in/out)
- Status kehadiran
- Catatan (jika ada)
- Durasi kerja

### 4. Laporan Absensi

#### Generate Laporan:
1. **Pilih Periode**: Harian, mingguan, bulanan, atau custom
2. **Pilih Pengguna**: Semua atau spesifik pengguna
3. **Format Output**: PDF, Excel, atau tampilan web
4. **Generate**: Klik "Buat Laporan"

#### Jenis Laporan:
- **Summary Report**: Ringkasan kehadiran
- **Detail Report**: Detail per hari
- **Late Report**: Laporan keterlambatan
- **Absence Report**: Laporan ketidakhadiran

---

## Manajemen Pengguna

### 1. Kelola User (Admin Only)

#### Menambah Pengguna Baru:
1. **Akses Menu**: Dashboard → "Kelola User" → "Tambah User"
2. **Isi Data**:
   - Nama lengkap
   - Email
   - Password
   - Role (Admin/Aslab/Mahasiswa/Dosen)
   - Program studi
   - Semester
   - Hari piket (untuk aslab)
3. **Simpan**: Klik "Tambah Pengguna"

#### Edit Pengguna:
1. **Cari Pengguna**: Gunakan pencarian atau filter
2. **Klik Edit**: Pada baris pengguna yang ingin diedit
3. **Update Data**: Ubah informasi yang diperlukan
4. **Simpan**: Klik "Update"

#### Manajemen Status:
- **Aktifkan/Nonaktifkan**: Toggle status aktif pengguna
- **Reset Password**: Reset password ke default
- **Hapus Pengguna**: Hapus pengguna dari sistem (hati-hati!)

### 2. Kelola Aslab (Admin Only)

#### Fungsi Khusus Aslab:
1. **Assignment Jadwal**: Assign hari piket
2. **RFID Registration**: Daftarkan kartu RFID
3. **Performance Tracking**: Track kinerja absensi
4. **Role Management**: Ubah role dan permissions

#### Bulk Operations:
- **Import Users**: Upload file Excel untuk import massal
- **Export Users**: Unduh daftar pengguna
- **Bulk Edit**: Edit multiple users sekaligus

### 3. Profile Management

#### Edit Profile Sendiri:
1. **Akses Menu**: Klik nama di pojok kanan atas → "Profile"
2. **Update Informasi**:
   - Nama
   - Email
   - Program studi
   - Semester
3. **Ganti Password**: Klik "Ganti Password"
4. **Simpan**: Klik "Update Profile"

#### Upload Foto Profile:
1. **Klik Upload**: Pada bagian foto profile
2. **Pilih File**: Maksimal 2MB, format JPG/PNG
3. **Crop**: Sesuaikan area crop jika diperlukan
4. **Simpan**: Foto akan ter-upload otomatis

---

## Manajemen Aset Laboratorium

### 1. Daftar Aset

#### Melihat Aset:
1. **Akses Menu**: Dashboard → "Aset Aslab"
2. **View Options**:
   - Grid view: Tampilan card dengan foto
   - List view: Tampilan tabel detail
3. **Filter Aset**:
   - Kategori: Berdasarkan jenis aset
   - Status: Tersedia/dipinjam/maintenance
   - Lokasi: Berdasarkan ruang lab

#### Informasi Aset:
- Kode aset (auto-generated)
- Nama aset
- Kategori/jenis
- Status kondisi
- Lokasi penyimpanan
- Foto aset
- Riwayat peminjaman

### 2. Tambah Aset Baru

#### Langkah-langkah:
1. **Klik "Tambah Aset"**: Pada halaman daftar aset
2. **Isi Formulir**:
   - Nama aset: Nama/merk peralatan
   - Jenis aset: Pilih dari dropdown
   - Deskripsi: Detail spesifikasi
   - Kondisi: Baik/rusak/maintenance
   - Lokasi: Ruang penyimpanan
3. **Upload Foto**: Foto peralatan (opsional)
4. **Simpan**: Klik "Tambah Aset"

#### Auto-Generate Kode:
- Sistem otomatis generate kode unik
- Format: [JENIS]-[TAHUN]-[NOMOR]
- Contoh: KOMP-2024-001

### 3. Edit dan Update Aset

#### Edit Informasi:
1. **Cari Aset**: Gunakan pencarian atau filter
2. **Klik Edit**: Pada aset yang ingin diubah
3. **Update Data**: Ubah informasi yang diperlukan
4. **Update Status**: Ubah status kondisi jika perlu
5. **Simpan**: Klik "Update Aset"

#### Hapus Aset:
- **Syarat**: Aset tidak sedang dipinjam
- **Konfirmasi**: Sistem akan minta konfirmasi
- **Backup**: Data akan di-soft delete (dapat dipulihkan)

### 4. Manajemen Jenis Aset

#### Tambah Kategori Baru:
1. **Akses Menu**: Dashboard → "Jenis Aset"
2. **Klik "Tambah Jenis"**
3. **Isi Data**:
   - Nama jenis
   - Deskripsi
   - Kode kategori
4. **Simpan**: Klik "Tambah"

#### Contoh Jenis Aset:
- Komputer & Laptop
- Peralatan Elektronik
- Alat Ukur
- Furniture Lab
- Projector & Display
- Network Equipment

---

## Manajemen Bahan

### 1. Daftar Bahan

#### Melihat Inventory Bahan:
1. **Akses Menu**: Dashboard → "Bahan"
2. **View Information**:
   - Nama bahan
   - Kategori
   - Stok tersedia
   - Satuan (pcs, liter, kg, dll)
   - Supplier
   - Tanggal expired (jika ada)

#### Filter dan Pencarian:
- **Kategori**: Filter berdasarkan jenis bahan
- **Status Stok**: Tersedia/habis/menipis
- **Expiry Date**: Bahan yang akan expired
- **Supplier**: Filter berdasarkan supplier

### 2. Tambah Bahan Baru

#### Input Bahan:
1. **Klik "Tambah Bahan"**
2. **Isi Formulir**:
   - Nama bahan
   - Kategori
   - Stok awal
   - Satuan
   - Harga per unit
   - Supplier
   - Tanggal expired (opsional)
   - Deskripsi
3. **Simpan**: Klik "Tambah Bahan"

### 3. Pencatatan Penggunaan

#### Record Usage:
1. **Pilih Bahan**: Dari daftar bahan
2. **Klik "Catat Penggunaan"**
3. **Isi Detail**:
   - Jumlah yang digunakan
   - Tujuan penggunaan
   - Tanggal penggunaan
   - Catatan tambahan
4. **Submit**: Stok akan otomatis berkurang

#### Approval Process:
- Penggunaan bahan dapat memerlukan approval
- Admin mendapat notifikasi untuk approval
- Status: Pending/Approved/Rejected

### 4. Laporan Bahan

#### Generate Reports:
- **Usage Report**: Laporan penggunaan per periode
- **Stock Report**: Laporan stok terkini
- **Low Stock Alert**: Bahan dengan stok menipis
- **Expiry Report**: Bahan yang akan expired

---

## Jadwal Piket

### 1. Generate Jadwal Otomatis

#### Auto Generate:
1. **Akses Menu**: Dashboard → "Jadwal Piket"
2. **Klik "Generate Otomatis"**
3. **Pilih Parameter**:
   - Bulan dan tahun
   - Hari kerja (Senin-Jumat atau include weekend)
   - Exclude tanggal libur
4. **Generate**: Sistem akan membuat jadwal otomatis

#### Algoritma Generate:
- Distribusi merata per aslab
- Hindari konflik jadwal
- Pertimbangkan preferensi hari
- Load balancing

### 2. Edit Manual Jadwal

#### Manual Adjustment:
1. **View Calendar**: Lihat jadwal dalam format kalender
2. **Klik Tanggal**: Untuk edit jadwal hari tertentu
3. **Assign Aslab**:
   - Drag & drop aslab ke tanggal
   - Multiple aslab per hari (jika perlu)
4. **Save**: Simpan perubahan

#### Swap Schedule:
- **Tukar Jadwal**: Antar aslab
- **Request Approval**: Jika diperlukan approval
- **Notification**: Pemberitahuan ke pihak terkait

### 3. View Jadwal

#### Calendar View:
- **Monthly View**: Tampilan bulanan
- **Weekly View**: Tampilan mingguan  
- **Daily View**: Detail harian
- **List View**: Tampilan list

#### Print & Export:
- **Print Schedule**: Print jadwal untuk ditempel
- **Export PDF**: Download jadwal dalam PDF
- **Export Excel**: Export ke Excel untuk editing

---

## Sistem RFID

### 1. Setup RFID Reader

#### Hardware Configuration:
1. **Connect Device**: Hubungkan RFID reader via USB/Network
2. **Driver Installation**: Install driver perangkat
3. **Network Setup**: Konfigurasi IP address (untuk network reader)
4. **Test Connection**: Test koneksi ke sistem

#### Software Configuration:
```
RFID API Endpoint: /api/rfid/scan
Method: POST
Format: JSON
Required Fields: rfid_code
```

### 2. Registrasi RFID Card

#### Daftarkan Kartu Baru:
1. **Akses Menu**: Dashboard → "RFID Registration"
2. **Pilih User**: Cari nama pengguna
3. **Scan Card**: Tempelkan kartu RFID ke reader
4. **Verify**: Sistem menampilkan kode RFID
5. **Save**: Klik "Daftarkan"

#### Bulk Registration:
- Upload file Excel dengan user data
- Scan multiple cards secara berurutan
- Sistem otomatis assign ke user

### 3. RFID Attendance Process

#### Flow Absensi:
1. **User Scan**: Tempelkan kartu ke reader
2. **System Check**: Validasi RFID code
3. **User Verification**: Tampilkan info user
4. **Attendance Logic**:
   - Jika belum check-in: Record check-in
   - Jika sudah check-in: Record check-out
   - Jika sudah lengkap: Show status
5. **Confirmation**: Tampilkan hasil absensi

#### Error Handling:
- **Unknown Card**: Kartu tidak terdaftar
- **Inactive User**: User tidak aktif
- **System Error**: Koneksi bermasalah

### 4. RFID Management

#### Card Management:
- **View Registered Cards**: Daftar kartu terdaftar
- **Unregister Card**: Hapus registrasi kartu
- **Replace Card**: Ganti kartu rusak/hilang
- **Block Card**: Blokir kartu sementara

#### System Monitoring:
- **Connection Status**: Status koneksi reader
- **Last Activity**: Aktivitas terakhir
- **Error Logs**: Log error sistem
- **Usage Statistics**: Statistik penggunaan

---

## Notifikasi

### 1. Jenis Notifikasi

#### Real-time Notifications:
- **Attendance Alert**: Notifikasi absensi baru
- **System Alert**: Peringatan sistem
- **User Activity**: Aktivitas pengguna
- **Asset Alert**: Notifikasi aset (peminjaman, pengembalian)

#### Email Notifications:
- **Daily Summary**: Ringkasan harian
- **Weekly Report**: Laporan mingguan
- **System Maintenance**: Pemberitahuan maintenance
- **Password Reset**: Reset password

### 2. Notification Center

#### Akses Notifikasi:
1. **Bell Icon**: Klik icon bell di header
2. **View All**: Lihat semua notifikasi
3. **Mark as Read**: Tandai sudah dibaca
4. **Filter**: Filter berdasarkan jenis/tanggal

#### Notification Types:
- **Info**: Informasi umum (biru)
- **Success**: Konfirmasi sukses (hijau)
- **Warning**: Peringatan (kuning)
- **Error**: Error/masalah (merah)

### 3. Notification Settings

#### Personal Settings:
1. **Akses**: Profile → "Notification Settings"
2. **Email Notifications**: On/off email alerts
3. **Push Notifications**: Browser push notifications
4. **Frequency**: Immediate/daily digest/weekly

#### Admin Settings:
- **System-wide Settings**: Pengaturan global
- **Template Management**: Edit template notifikasi
- **Delivery Methods**: Email, SMS, push, dll

---

## API Documentation

### 1. Authentication API

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {...},
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

#### Get User Info
```http
GET /api/user
Authorization: Bearer {token}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {token}
```

### 2. RFID API

#### Scan for Attendance
```http
POST /api/rfid/scan-for-attendance
Content-Type: application/json

{
  "rfid_code": "ABC12345"
}
```

#### Register RFID
```http
POST /api/rfid/register
Content-Type: application/json

{
  "user_id": 1,
  "rfid_code": "ABC12345"
}
```

### 3. Item Search API

#### Search Items
```http
GET /api/items/search?q=keyword&type=aset
Authorization: Bearer {token}
```

### 4. Error Responses

#### Standard Error Format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

#### HTTP Status Codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Server Error

---

## Troubleshooting

### 1. Login Issues

#### Problem: Tidak bisa login
**Kemungkinan Penyebab:**
- Email/password salah
- Akun tidak aktif
- Browser cache issue

**Solusi:**
1. Periksa email dan password
2. Gunakan fitur "Lupa Password"
3. Clear browser cache
4. Hubungi admin jika akun diblokir

#### Problem: Redirect loop after login
**Solusi:**
1. Clear cookies dan session
2. Logout dan login ulang
3. Periksa konfigurasi server

### 2. RFID Issues

#### Problem: RFID tidak terbaca
**Solusi:**
1. Periksa koneksi hardware
2. Restart RFID reader
3. Test dengan kartu lain
4. Periksa konfigurasi API

#### Problem: Wrong user detected
**Solusi:**
1. Re-register RFID card
2. Clear card registry
3. Check for duplicate cards

### 3. Performance Issues

#### Problem: Aplikasi lambat
**Solusi:**
1. Clear browser cache
2. Periksa koneksi internet
3. Restart browser
4. Hubungi admin untuk server issue

#### Problem: Database timeout
**Solusi:**
1. Refresh halaman
2. Coba lagi dalam beberapa menit
3. Laporkan ke admin

### 4. Feature Issues

#### Problem: Upload file gagal
**Solusi:**
1. Periksa ukuran file (max 2MB untuk foto)
2. Periksa format file yang didukung
3. Periksa koneksi internet
4. Coba browser berbeda

#### Problem: Notifikasi tidak muncul
**Solusi:**
1. Enable browser notifications
2. Periksa notification settings
3. Refresh halaman
4. Clear browser data

---

## FAQ

### Q: Bagaimana cara mengganti password?
**A:** Login → Profile → Ganti Password → Masukkan password lama dan baru → Save

### Q: Siapa yang bisa mengakses fitur admin?
**A:** Hanya user dengan role "admin" yang dapat mengakses semua fitur admin

### Q: Bagaimana jika RFID card hilang?
**A:** Hubungi admin untuk:
1. Block card lama
2. Daftarkan card baru
3. Update data di sistem

### Q: Apakah bisa absen manual tanpa RFID?
**A:** Ya, admin dan aslab dapat melakukan absensi manual melalui menu "Absen Manual"

### Q: Bagaimana cara melihat laporan absensi?
**A:** Dashboard → Riwayat Absensi → Filter data → Export laporan

### Q: Apa yang dilakukan jika lupa check-out?
**A:** Hubungi admin untuk:
1. Manual check-out
2. Edit riwayat absensi
3. Update data

### Q: Bagaimana sistem mendeteksi keterlambatan?
**A:** Sistem membandingkan waktu check-in dengan jadwal piket yang ditetapkan

### Q: Bisakah mengakses sistem dari mobile?
**A:** Ya, sistem responsive dan dapat diakses dari smartphone

### Q: Bagaimana cara backup data?
**A:** Admin dapat melakukan:
1. Export database
2. Download laporan
3. Backup file uploads

### Q: Apa yang dilakukan jika sistem error?
**A:** 
1. Refresh halaman
2. Clear browser cache
3. Coba browser lain
4. Hubungi IT support

---

## Kontak Support

### Technical Support
- **Email**: support@absensi-aslab.com
- **Phone**: (021) 1234-5678
- **WhatsApp**: 081234567890

### Admin Contact
- **Email**: admin@absensi-aslab.com
- **Office Hours**: Senin-Jumat, 08:00-17:00

### Emergency Contact
- **24/7 Hotline**: 0800-1234-5678
- **Emergency Email**: emergency@absensi-aslab.com

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Basic attendance system
- RFID integration
- User management
- Asset management
- Dashboard analytics

### Planned Updates
- Mobile app (iOS/Android)
- Advanced reporting
- Integration with academic system
- Biometric authentication
- Enhanced notifications

---

*Dokumentasi ini akan terus diupdate seiring dengan perkembangan sistem. Untuk pertanyaan atau saran, silakan hubungi tim development.*
