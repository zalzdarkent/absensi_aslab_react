# Template Dokumentasi Pengujian dengan Screenshot

## Cara Menyertakan Screenshot dalam Dokumentasi

### 1. Format Markdown untuk Gambar

```markdown
![Alt Text](path/to/image.png)
*Caption: Deskripsi screenshot*
```

### 2. Contoh Implementasi dalam Test Case

#### Test Case dengan Screenshot Evidence

**Test Case ID:** TC-AUTH-001  
**Scenario:** Valid Login Process  
**Status:** ✅ PASS

**Test Steps:**
1. Navigate to login page
2. Enter valid credentials
3. Click login button
4. Verify dashboard loads

**Screenshots:**

![Login Page](evidence/screenshots/authentication/login-page.png)
*Caption: Halaman login dengan form email dan password*

![Valid Credentials](evidence/screenshots/authentication/login-valid-input.png)
*Caption: Form login diisi dengan kredensial yang valid*

![Dashboard After Login](evidence/screenshots/authentication/login-success-dashboard.png)
*Caption: Dashboard admin setelah login berhasil, menampilkan statistik real-time*

---

### 3. Template untuk Bug Report dengan Screenshot

**Bug ID:** BUG-001  
**Summary:** Error validation tidak muncul pada form kosong  
**Severity:** Medium  

**Steps to Reproduce:**
1. Navigate to registration page
2. Leave all fields empty
3. Click submit button

**Expected Result:** Validation errors should appear  
**Actual Result:** Form submits without validation  

**Evidence:**

![Empty Form](evidence/screenshots/errors/empty-form-bug.png)
*Caption: Form registrasi kosong sebelum submit*

![No Validation](evidence/screenshots/errors/no-validation-error.png)
*Caption: Form ter-submit tanpa menampilkan error validation*

![Expected Behavior](evidence/screenshots/errors/expected-validation.png)
*Caption: Contoh validation error yang seharusnya muncul*

---

### 4. Template untuk Cross-Browser Testing

#### Browser Compatibility Evidence

**Chrome 119+ Testing:**

![Chrome Login](evidence/screenshots/cross-browser/chrome-login.png)
*Caption: Halaman login di Chrome - berfungsi normal*

![Chrome Dashboard](evidence/screenshots/cross-browser/chrome-dashboard.png)
*Caption: Dashboard di Chrome - layout dan fungsi sempurna*

**Firefox 118+ Testing:**

![Firefox Login](evidence/screenshots/cross-browser/firefox-login.png)
*Caption: Halaman login di Firefox - compatible*

![Firefox Dashboard](evidence/screenshots/cross-browser/firefox-dashboard.png)
*Caption: Dashboard di Firefox - semua element terrender dengan baik*

**Safari 16+ Testing:**

![Safari Login](evidence/screenshots/cross-browser/safari-login.png)
*Caption: Halaman login di Safari - berfungsi normal*

![Safari RFID Issue](evidence/screenshots/cross-browser/safari-rfid-issue.png)
*Caption: Minor issue dengan RFID scanner di Safari*

---

### 5. Template untuk Mobile Responsiveness

#### Mobile Testing Evidence

**iPhone 14 (375x812):**

![iPhone Login](evidence/screenshots/mobile/iphone-login.png)
*Caption: Halaman login responsive di iPhone 14*

![iPhone Dashboard](evidence/screenshots/mobile/iphone-dashboard.png)
*Caption: Dashboard mobile view dengan navigation yang mudah*

**Samsung Galaxy S23 (360x780):**

![Android Login](evidence/screenshots/mobile/android-login.png)
*Caption: Login page di Samsung Galaxy S23*

![Android Attendance](evidence/screenshots/mobile/android-attendance.png)
*Caption: Fitur absensi berfungsi dengan baik di Android*

---

### 6. Template untuk User Flow Testing

#### Complete User Journey Evidence

**Scenario:** Daily Attendance Process

**Step 1: RFID Scan**
![RFID Scanning](evidence/screenshots/attendance/rfid-scan-process.png)
*Caption: User melakukan scan RFID card untuk check-in*

**Step 2: User Verification**
![User Info Display](evidence/screenshots/attendance/user-verification.png)
*Caption: Sistem menampilkan informasi user yang terdeteksi*

**Step 3: Attendance Recorded**
![Success Message](evidence/screenshots/attendance/checkin-success.png)
*Caption: Konfirmasi check-in berhasil dengan timestamp*

**Step 4: Dashboard Update**
![Real-time Update](evidence/screenshots/dashboard/realtime-update.png)
*Caption: Dashboard admin terupdate real-time menampilkan data absensi terbaru*

---

### 7. Template untuk Performance Testing

#### Performance Evidence

**Page Load Time Testing:**

![Performance Metrics](evidence/screenshots/performance/page-load-metrics.png)
*Caption: Chrome DevTools menunjukkan page load time <3 detik*

![Network Analysis](evidence/screenshots/performance/network-analysis.png)
*Caption: Network tab menampilkan request/response time yang optimal*

**Memory Usage:**

![Memory Usage](evidence/screenshots/performance/memory-usage.png)
*Caption: Task Manager menunjukkan penggunaan memory yang wajar*

---

### 8. Best Practices untuk Screenshot

#### Do's ✅
- Gunakan resolusi tinggi (minimal 1920x1080)
- Crop area yang relevan, buang space kosong
- Highlight element penting dengan arrow/box
- Blur informasi sensitif (password, email pribadi)
- Konsisten dalam naming convention
- Tambahkan timestamp untuk version tracking

#### Don'ts ❌
- Jangan screenshot full desktop dengan taskbar
- Jangan include cursor kecuali untuk demo interaction
- Jangan gunakan gambar blur atau low quality
- Jangan lupa caption yang jelas
- Jangan expose data production dalam testing

#### Annotation Tools
- **Windows Snipping Tool**: Basic annotation
- **Greenshot**: Advanced annotation dengan arrow, text
- **Lightshot**: Quick online sharing
- **Paint.NET/GIMP**: Advanced editing

---

### 9. Organization Tips

#### Folder Structure
```
evidence/
├── screenshots/
│   ├── authentication/
│   ├── attendance/
│   ├── user-management/
│   ├── dashboard/
│   ├── reports/
│   ├── errors/
│   ├── mobile/
│   └── cross-browser/
├── videos/
│   ├── user-flows/
│   └── bug-reproductions/
└── test-data/
    ├── sample-accounts.md
    └── test-scenarios.md
```

#### File Naming
- `auth-login-success-20241013.png`
- `dashboard-stats-admin-view.png`
- `bug-validation-error-chrome.png`
- `mobile-responsive-iphone14.png`

---

### 10. Integration dengan Git

#### .gitignore Considerations
```gitignore
# Include test evidence
!evidence/screenshots/
!evidence/videos/
!evidence/test-data/

# But exclude large files
evidence/videos/*.mp4
evidence/screenshots/*.gif
```

#### Commit Messages
```bash
git add evidence/screenshots/
git commit -m "Add test evidence: authentication module screenshots"
```

---

**Note:** Template ini dapat disesuaikan dengan kebutuhan project dan standar dokumentasi yang digunakan.
