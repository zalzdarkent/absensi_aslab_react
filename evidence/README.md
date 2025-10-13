# Evidence Directory - Test Documentation

Folder ini berisi semua bukti pengujian (evidence) untuk sistem Absensi Aslab.

## Struktur Folder

```
evidence/
├── screenshots/          # Screenshot test execution
│   ├── login/            # Login process screenshots
│   ├── dashboard/        # Dashboard functionality
│   ├── attendance/       # Attendance features
│   ├── user-management/  # User management
│   ├── assets/           # Asset management
│   └── reports/          # Report generation
├── videos/               # Video recordings of test execution
├── documents/            # Test documents dan reports
├── test-data/            # Sample test data dan exports
└── bug-reports/          # Bug documentation dan screenshots

```

## Panduan Pengambilan Evidence

### 1. Screenshots
- **Format**: PNG atau JPG
- **Naming Convention**: `[module]-[feature]-[step].png`
- **Contoh**: `login-valid-credentials-success.png`
- **Resolution**: Minimum 1280x720
- **Include**: Browser address bar dan timestamp

### 2. Video Recordings
- **Format**: MP4
- **Duration**: Maksimal 5 menit per test scenario
- **Quality**: 720p minimum
- **Audio**: Include narration jika diperlukan
- **Naming**: `[module]-[scenario]-recording.mp4`

### 3. Test Data
- **Input Data**: Simpan sample data yang digunakan
- **Output Files**: Export results dari testing
- **Database Dumps**: Snapshot database state
- **Log Files**: System logs selama testing

### 4. Bug Reports
- **Screenshots**: Visual evidence dari bug
- **Console Logs**: Browser console errors
- **Network Logs**: API call failures
- **System Logs**: Server-side errors

## Template File Names

### Screenshots
```
login-page-load.png
login-valid-credentials.png
login-invalid-credentials.png
login-validation-errors.png
dashboard-admin-view.png
dashboard-statistics.png
rfid-scan-success.png
rfid-scan-failure.png
attendance-manual-entry.png
attendance-history-view.png
user-management-create.png
user-management-edit.png
asset-management-view.png
asset-creation-form.png
report-generation.png
report-export-success.png
```

### Videos
```
login-flow-complete.mp4
rfid-scanning-demo.mp4
admin-dashboard-tour.mp4
attendance-workflow.mp4
user-management-demo.mp4
asset-management-workflow.mp4
mobile-responsiveness.mp4
cross-browser-testing.mp4
```

## Checklist untuk Evidence Collection

### Login & Authentication
- [ ] Login page loading
- [ ] Valid login success
- [ ] Invalid login error
- [ ] Password reset flow
- [ ] Logout process
- [ ] Session timeout

### Dashboard
- [ ] Dashboard overview
- [ ] Statistics display
- [ ] Real-time updates
- [ ] Navigation menu
- [ ] User profile section

### Attendance Management
- [ ] RFID scan interface
- [ ] Successful scan result
- [ ] Failed scan handling
- [ ] Manual attendance entry
- [ ] Attendance history view
- [ ] Report generation

### User Management (Admin)
- [ ] User list view
- [ ] Add new user form
- [ ] Edit user details
- [ ] User role assignment
- [ ] User deactivation
- [ ] Bulk operations

### Asset Management
- [ ] Asset catalog view
- [ ] Asset creation form
- [ ] Asset editing
- [ ] Asset search/filter
- [ ] Asset borrowing process
- [ ] Return process

### Reports & Analytics
- [ ] Report generation interface
- [ ] Various report types
- [ ] Export functionality
- [ ] Print preview
- [ ] Data filtering

### Mobile & Browser Testing
- [ ] Mobile responsive design
- [ ] Chrome compatibility
- [ ] Firefox compatibility
- [ ] Safari compatibility
- [ ] Edge compatibility

### Error Handling
- [ ] Network error handling
- [ ] Server error responses
- [ ] Validation error display
- [ ] User-friendly error messages
- [ ] Recovery mechanisms

## Tools untuk Evidence Collection

### Screenshot Tools
- **Snipping Tool** (Windows)
- **Screenshot** (macOS)
- **Browser DevTools** (F12)
- **Full Page Screenshot Extensions**

### Video Recording
- **OBS Studio** (Free, cross-platform)
- **ScreenToGif** (Windows, for short clips)
- **QuickTime** (macOS)
- **Browser recording extensions**

### Console Log Capture
- **Browser DevTools Console**
- **Network Tab** untuk API calls
- **Application Tab** untuk localStorage/sessionStorage

## Quality Standards

### Screenshots
- Clear dan readable text
- Complete UI elements visible
- No personal/sensitive data exposed
- Proper timestamp/date visible
- Browser information visible

### Videos
- Smooth recording without lag
- Clear audio narration
- Logical flow demonstrating scenario
- Proper pacing (not too fast/slow)
- Clear resolution and quality

### Documentation
- Proper file organization
- Descriptive naming conventions
- README files untuk context
- Version control untuk updates
- Cross-references dengan test cases

## Evidence Review Checklist

Sebelum submit evidence, pastikan:

- [ ] Semua required screenshots tersedia
- [ ] File names sesuai convention
- [ ] Quality screenshots memadai
- [ ] Video recordings complete
- [ ] Test data files included
- [ ] Bug evidence properly documented
- [ ] Cross-references dengan test cases
- [ ] No sensitive data exposed
- [ ] Files properly organized
- [ ] README updated dengan info terbaru

---

**Note**: Evidence ini akan digunakan untuk:
1. Academic submission
2. Quality assurance review
3. User acceptance testing
4. Client presentation
5. Documentation purposes
