# Screenshots - Bukti Hasil Pengujian

## Struktur Folder Screenshots

Folder ini berisi screenshot dan bukti visual dari pengujian sistem. Organisasi folder sebagai berikut:

```
screenshots/
├── authentication/          # Screenshot untuk modul autentikasi
│   ├── login-success.png
│   ├── login-error.png
│   ├── password-reset.png
│   └── logout.png
├── attendance/              # Screenshot untuk modul absensi
│   ├── rfid-scan.png
│   ├── manual-checkin.png
│   ├── attendance-history.png
│   └── duplicate-prevention.png
├── user-management/         # Screenshot untuk manajemen user
│   ├── add-user.png
│   ├── edit-user.png
│   ├── delete-user.png
│   └── user-search.png
├── dashboard/               # Screenshot dashboard
│   ├── admin-dashboard.png
│   ├── real-time-data.png
│   └── statistics.png
├── reports/                 # Screenshot laporan
│   ├── report-generation.png
│   ├── excel-export.png
│   └── pdf-export.png
├── errors/                  # Screenshot error handling
│   ├── validation-errors.png
│   ├── network-error.png
│   └── session-expired.png
├── mobile/                  # Screenshot mobile responsiveness
│   ├── mobile-login.png
│   ├── mobile-dashboard.png
│   └── mobile-attendance.png
└── cross-browser/           # Screenshot berbagai browser
    ├── chrome-compatibility.png
    ├── firefox-compatibility.png
    └── safari-compatibility.png
```

## Naming Convention

Gunakan naming convention berikut untuk konsistensi:
- Format: `[module]-[action]-[status].png`
- Contoh: `auth-login-success.png`, `attendance-rfid-error.png`
- Gunakan huruf kecil dan tanda strip (-) sebagai pemisah
- Tambahkan timestamp jika diperlukan: `dashboard-stats-20241013.png`

## Tools untuk Screenshot

### Windows
- **Snipping Tool**: Tool bawaan Windows
- **Windows + Shift + S**: Screenshot area tertentu
- **Print Screen**: Screenshot layar penuh
- **Greenshot**: Tool gratis dengan fitur annotasi

### Chrome DevTools
- **F12 > Device Toolbar**: Untuk mobile view
- **Ctrl + Shift + P > Screenshot**: Full page screenshot
- **Network Tab**: Untuk capture network requests

### Extension Browser
- **Awesome Screenshot**: Capture dan edit
- **Lightshot**: Quick screenshot dengan sharing
- **FireShot**: Full page capture

## Best Practices

1. **Resolution**: Minimal 1920x1080 untuk desktop, 375x667 untuk mobile
2. **Format**: PNG untuk UI, JPG untuk photo/complex images
3. **Size**: Compress jika ukuran >500KB
4. **Annotation**: Tambahkan arrow, highlight, atau notes jika perlu
5. **Privacy**: Blur atau hide data sensitif (password, personal info)

## Template Caption

Setiap screenshot harus memiliki caption yang jelas:
```
![Alt Text](path/to/image.png)
*Caption: Deskripsi singkat apa yang ditampilkan dalam screenshot*
```

Contoh:
```
![Login Success](authentication/login-success.png)
*Caption: Halaman dashboard setelah login berhasil dengan user admin*
```
