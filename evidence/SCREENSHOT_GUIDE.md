# Panduan Mengambil Screenshot untuk Dokumentasi Pengujian

## Tools dan Teknik Screenshot

### 1. Windows Built-in Tools

#### Snipping Tool
```
Start > Search "Snipping Tool"
- New: Buat screenshot baru
- Mode: Pilih area (Rectangle, Window, Full Screen)
- Delay: Set timer 1-10 detik
- Save: Simpan ke folder evidence/screenshots/
```

#### Keyboard Shortcuts
```
Windows + Shift + S     : Screenshot area tertentu
Print Screen           : Screenshot layar penuh
Alt + Print Screen     : Screenshot window aktif
Windows + Print Screen : Screenshot dan save otomatis
```

### 2. Browser Screenshots

#### Chrome DevTools
```
F12 > Console > Ctrl+Shift+P
Type: "screenshot"
Options:
- Capture area screenshot
- Capture full size screenshot
- Capture node screenshot
- Capture screenshot
```

#### Browser Extensions
- **Awesome Screenshot**: Capture + edit
- **Lightshot**: Quick capture + share
- **FireShot**: Full page capture
- **Nimbus Screenshot**: Advanced features

### 3. Mobile Testing Screenshots

#### Chrome DevTools Mobile Simulation
```
1. F12 > Toggle Device Toolbar (Ctrl+Shift+M)
2. Select device (iPhone, Galaxy, iPad)
3. Navigate and test
4. Capture screenshot (Ctrl+Shift+P > screenshot)
```

#### Real Device Testing
```
Android:
- Power + Volume Down (3 seconds)
- Screenshots saved to Gallery

iPhone:
- Side Button + Volume Up
- Screenshots saved to Photos
```

## Panduan Step-by-Step

### Scenario 1: Testing Login Process

#### Persiapan
1. Buka browser Chrome
2. Navigate ke `http://localhost:8000/login`
3. Siapkan test credentials

#### Capture Process
```
Step 1: Initial Login Page
- Screenshot: auth-login-initial.png
- Caption: "Halaman login sebelum input kredensial"

Step 2: Valid Credentials Input
- Fill form dengan test account
- Screenshot: auth-login-filled.png
- Caption: "Form login diisi dengan kredensial valid"

Step 3: Login Success
- Click submit
- Wait for redirect
- Screenshot: auth-login-success.png
- Caption: "Dashboard setelah login berhasil"

Step 4: Error Case
- Use invalid credentials
- Screenshot: auth-login-error.png
- Caption: "Error message untuk kredensial invalid"
```

### Scenario 2: RFID Attendance Testing

#### Hardware Setup
1. Connect RFID scanner via USB
2. Open sistem absensi
3. Navigate to attendance page

#### Capture Process
```
Step 1: RFID Scanner Ready
- Screenshot: rfid-scanner-ready.png
- Caption: "Interface RFID scanner siap digunakan"

Step 2: Card Detection
- Place card on scanner
- Screenshot: rfid-card-detected.png
- Caption: "Sistem mendeteksi RFID card dan menampilkan user info"

Step 3: Check-in Success
- Confirm attendance
- Screenshot: rfid-checkin-success.png
- Caption: "Absensi berhasil dicatat dengan timestamp"

Step 4: Duplicate Prevention
- Try scan same card again
- Screenshot: rfid-duplicate-prevention.png
- Caption: "Sistem mencegah duplicate check-in pada hari yang sama"
```

### Scenario 3: Mobile Responsiveness Testing

#### Setup Mobile View
```
1. Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Select device: iPhone 14 Pro (390x844)
4. Reload page
```

#### Capture Process
```
Step 1: Mobile Login
- Screenshot: mobile-login-iphone14.png
- Caption: "Halaman login responsive di iPhone 14"

Step 2: Mobile Dashboard
- Login and navigate to dashboard
- Screenshot: mobile-dashboard-iphone14.png
- Caption: "Dashboard mobile dengan navigation yang user-friendly"

Step 3: Landscape Mode
- Rotate to landscape
- Screenshot: mobile-landscape-iphone14.png
- Caption: "Layout landscape masih tertata dengan baik"
```

### Scenario 4: Cross-Browser Testing

#### Browser Matrix Testing
```
Chrome Testing:
1. Open Chrome 119+
2. Test all major features
3. Screenshots: chrome-[feature].png

Firefox Testing:
1. Open Firefox 118+
2. Test same features
3. Screenshots: firefox-[feature].png

Safari Testing:
1. Open Safari 16+
2. Test and note any issues
3. Screenshots: safari-[feature].png
```

## Screenshot Quality Guidelines

### Technical Requirements
```
Resolution: Minimum 1920x1080 (desktop)
           Minimum 375x667 (mobile)
Format: PNG for UI screenshots
        JPG for photos/complex images
Size: Compress if > 500KB
DPI: 96 DPI for web display
```

### Composition Guidelines
```
Crop: Remove unnecessary whitespace
Focus: Highlight relevant UI elements
Context: Include enough context for understanding
Annotation: Add arrows, highlights when needed
Privacy: Blur sensitive information
```

### Naming Convention
```
Format: [module]-[action]-[result]-[browser]-[date].png

Examples:
- auth-login-success-chrome-20241013.png
- dashboard-stats-load-firefox-20241013.png
- mobile-responsive-iphone14-20241013.png
- error-validation-failed-safari-20241013.png
```

## Annotation dan Editing

### Windows Paint (Basic)
```
1. Open screenshot in Paint
2. Use Text tool for labels
3. Use Brush for highlighting
4. Use Rectangle for boxes
5. Save as PNG
```

### Greenshot (Recommended)
```
Download: https://getgreenshot.org/
Features:
- Screenshot capture
- Built-in editor
- Annotation tools
- Direct save to folder
```

### Advanced Editing (GIMP/Paint.NET)
```
For complex annotations:
- Multiple layers
- Professional arrows
- Text with backgrounds
- Blur sensitive data
- Batch processing
```

## Workflow Integration

### Daily Testing Workflow
```
1. Morning Setup
   - Create daily folder: screenshots/YYYY-MM-DD/
   - Open testing checklist
   - Prepare test environment

2. During Testing
   - Screenshot before action
   - Screenshot after action
   - Screenshot any errors
   - Immediate file naming

3. End of Day
   - Review all screenshots
   - Add captions to README
   - Commit to git repository
   - Update test documentation
```

### Git Integration
```bash
# Add new screenshots
git add evidence/screenshots/

# Commit with descriptive message
git commit -m "Add test evidence: authentication module - all browsers"

# Push to remote
git push origin main
```

## Common Mistakes to Avoid

### Technical Issues
❌ Low resolution screenshots  
❌ Including personal/sensitive data  
❌ Screenshots without context  
❌ Poor file naming  
❌ Missing captions  

### Process Issues
❌ Taking screenshots after finishing testing  
❌ Not organizing by module/feature  
❌ Forgetting to test edge cases  
❌ Not documenting bugs with screenshots  
❌ Not versioning screenshot updates  

## Automation Options

### Browser Automation (Advanced)
```javascript
// Puppeteer example for automated screenshots
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000/login');
  await page.screenshot({path: 'evidence/screenshots/auth-login-auto.png'});
  await browser.close();
})();
```

### Batch Screenshot Tools
- **ScreenToGif**: For recording interactions
- **ShareX**: Advanced screenshot automation
- **Selenium**: Web automation with screenshots

## Quality Checklist

### Before Submitting Screenshots
- [ ] Resolution appropriate for viewing
- [ ] File size optimized (<500KB)
- [ ] Proper naming convention followed
- [ ] Sensitive data blurred/removed
- [ ] Clear caption provided
- [ ] Organized in correct folder
- [ ] Relevant to test case
- [ ] Shows clear evidence of test result

### Documentation Integration
- [ ] Screenshots referenced in test cases
- [ ] Captions match screenshot content
- [ ] File paths correct in markdown
- [ ] Alternative text provided
- [ ] Evidence supports test conclusions

---

**Tips:** Konsistensi adalah kunci. Gunakan template dan workflow yang sama untuk semua testing session agar dokumentasi terlihat profesional dan mudah dipahami.
