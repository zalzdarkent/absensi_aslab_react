# Evidence Folder - Dokumentasi Bukti Pengujian

## Struktur Folder

```
evidence/
├── README.md                    # Panduan penggunaan folder evidence
├── SCREENSHOT_TEMPLATE.md       # Template untuk dokumentasi dengan screenshot
├── SCREENSHOT_GUIDE.md          # Panduan mengambil screenshot
├── TEST_CASE_TEMPLATE.md        # Template test case
├── TESTING_EXECUTION_LOG.md     # Log eksekusi testing
├── screenshots/                 # Screenshot hasil pengujian
│   ├── README.md               # Panduan screenshot
│   ├── authentication/         # Screenshot modul autentikasi
│   ├── attendance/             # Screenshot modul absensi
│   ├── user-management/        # Screenshot manajemen user
│   ├── dashboard/              # Screenshot dashboard
│   ├── reports/                # Screenshot laporan
│   ├── errors/                 # Screenshot error handling
│   ├── mobile/                 # Screenshot mobile responsiveness
│   └── cross-browser/          # Screenshot compatibility browser
├── videos/                     # Video recording pengujian
│   ├── authentication/        # Video login/logout flows
│   ├── attendance/            # Video RFID scanning demo
│   ├── dashboard/             # Video dashboard features
│   ├── mobile/                # Video mobile responsiveness
│   ├── user-management/       # Video user CRUD operations
│   ├── reports/               # Video report generation
│   └── bugs/                  # Video bug reproduction
└── test-data/                 # Data testing dan sample accounts
    ├── sample-accounts.json   # Test user accounts
    ├── rfid-cards.json       # Test RFID cards
    └── test-scenarios.md      # Dokumentasi skenario testing
```

## Cara Menggunakan

### 1. Mengambil Screenshot

Ikuti panduan di `SCREENSHOT_GUIDE.md` untuk:
- Tools yang direkomendasikan
- Teknik pengambilan screenshot
- Naming convention yang konsisten
- Quality guidelines

### 2. Menyimpan Evidence

```bash
# Struktur file naming
[module]-[action]-[result]-[browser/device]-[date].png

# Contoh:
auth-login-success-chrome-20241013.png
dashboard-stats-load-firefox-20241013.png
mobile-responsive-iphone14-20241013.png
```

### 3. Dokumentasi Screenshot

Setiap screenshot harus disertai dengan:
- **Alt text**: Deskripsi singkat untuk accessibility
- **Caption**: Penjelasan detail apa yang ditampilkan
- **Context**: Link ke test case yang relevan

```markdown
![Login Success](screenshots/authentication/login-success.png)
*Caption: Dashboard admin setelah login berhasil menampilkan statistik real-time*
```

### 4. Video Recording

Untuk scenario kompleks, gunakan video recording:
- Format: MP4 (H.264)
- Resolution: 1920x1080 (desktop), 1080x1920 (mobile)
- Duration: 30 detik - 2 menit
- File size: <10MB

Tools yang direkomendasikan:
- **OBS Studio**: Recording layar gratis
- **ScreenToGif**: Recording ke GIF
- **Windows Game Bar**: Win+G untuk quick recording

## Quality Standards

### Screenshot Requirements
- **Resolution**: Minimum 1920x1080 (desktop), 375x667 (mobile)
- **Format**: PNG untuk UI, JPG untuk foto
- **Size**: Maksimum 500KB per file
- **Quality**: Jelas, tidak blur, cropped dengan baik

### Documentation Standards
- Setiap screenshot memiliki caption yang jelas
- File naming konsisten dan descriptive
- Organized by module/feature
- Referenced dalam test case documentation

## Integration dengan Git

### Files to Include
```gitignore
# Include evidence files
evidence/screenshots/
evidence/videos/
evidence/test-data/

# Exclude large files
evidence/videos/*.mov
evidence/screenshots/*.gif
```

### Commit Guidelines
```bash
# Add evidence untuk specific module
git add evidence/screenshots/authentication/
git commit -m "Add authentication module test evidence"

# Add complete test evidence
git add evidence/
git commit -m "Add complete test evidence for sprint 1"
```

## Best Practices

### 🟢 Do's
- Screenshot sebelum dan sesudah action
- Highlight elemen penting dengan annotation
- Blur informasi sensitif (password, personal data)
- Gunakan consistent naming convention
- Update documentation bersamaan dengan screenshot
- Test di multiple browser dan device

### 🔴 Don'ts
- Screenshot full desktop dengan taskbar
- Include cursor kecuali untuk demo interaction
- Menggunakan screenshot blur atau low quality
- Lupa memberikan caption yang jelas
- Expose data production dalam testing screenshot
- Upload file berukuran besar tanpa compression

## Tools dan Resources

### Screenshot Tools
- **Windows Snipping Tool**: Basic screenshot
- **Greenshot**: Advanced annotation
- **Lightshot**: Quick sharing
- **Chrome DevTools**: Browser testing

### Video Recording Tools
- **OBS Studio**: Professional recording
- **ScreenToGif**: Recording to GIF
- **Windows Game Bar**: Quick recording
- **Camtasia**: Professional editing

### Image Editing
- **Paint.NET**: Free Windows editor
- **GIMP**: Advanced free editor
- **Canva**: Online editing dengan template
- **Figma**: Design dan annotation

## Contact

Untuk pertanyaan tentang documentation standards atau tools:
- Technical Lead: [Contact Info]
- QA Team: [Contact Info]
- Documentation Team: [Contact Info]

---

*Dokumentasi ini diupdate secara berkala. Last updated: October 13, 2024*
