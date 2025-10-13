# Test Case Template - Black Box Testing

## Test Case Information
- **Test Case ID**: BT-[MODULE]-[NUMBER]
- **Test Case Title**: [Descriptive title of what is being tested]
- **Module**: [Authentication/Dashboard/Attendance/UserManagement/AssetManagement/Reports]
- **Priority**: [High/Medium/Low]
- **Test Type**: [Functional/UI/Integration/Boundary/Error]
- **Test Method**: Black Box Testing

## Test Environment
- **Browser**: [Chrome/Firefox/Safari/Edge] Version [X.X]
- **Operating System**: [Windows 11/macOS/Linux]
- **Device**: [Desktop/Mobile/Tablet]
- **Screen Resolution**: [1920x1080/1366x768/Mobile size]
- **Network**: [WiFi/Mobile Data/Ethernet]

## Preconditions
List all conditions that must be met before executing this test:
- [ ] Application is accessible
- [ ] Database contains test data
- [ ] User accounts are available
- [ ] Required hardware is connected (RFID reader if applicable)
- [ ] Browser cache is cleared

## Test Data
```
Test Account:
- Email: [test email]
- Password: [test password]
- Role: [admin/aslab/mahasiswa/dosen]

Additional Data:
- RFID Code: [if applicable]
- Test Files: [if file upload required]
- Sample Data: [any specific data needed]
```

## Test Steps
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1    | [Detailed step description] | [What should happen] |
| 2    | [Detailed step description] | [What should happen] |
| 3    | [Detailed step description] | [What should happen] |
| 4    | [Detailed step description] | [What should happen] |
| 5    | [Detailed step description] | [What should happen] |

## Expected Results
Describe the overall expected outcome of the test:
- [Primary expected result]
- [Secondary expected result]
- [Any specific UI changes expected]
- [Data changes expected]
- [System responses expected]

## Actual Results
Record what actually happened during test execution:
- [What was observed]
- [Any differences from expected results]
- [System behavior notes]
- [Performance observations]

## Test Evidence
### Screenshots
- [ ] Screenshot 1: [description] - `filename.png`
- [ ] Screenshot 2: [description] - `filename.png`
- [ ] Screenshot 3: [description] - `filename.png`

### Video Recording
- [ ] Video: [description] - `filename.mp4`

### Additional Evidence
- [ ] Console logs: `filename.txt`
- [ ] Network logs: `filename.har`
- [ ] Exported data: `filename.xlsx`

## Pass/Fail Criteria
- **Pass**: All expected results match actual results
- **Fail**: Any deviation from expected results
- **Blocked**: Cannot execute due to system/environment issues

## Test Status
- **Status**: [Pass/Fail/Blocked/Not Executed]
- **Execution Date**: [YYYY-MM-DD]
- **Execution Time**: [HH:MM - HH:MM]
- **Executed By**: [Tester Name]
- **Reviewed By**: [Reviewer Name]

## Defects Found
If test fails, record defect information:
- **Defect ID**: [DEF-XXX]
- **Defect Title**: [Brief description]
- **Severity**: [Critical/High/Medium/Low]
- **Steps to Reproduce**: [Brief steps]
- **Attached Evidence**: [List of screenshots/videos]

## Comments/Notes
Add any additional observations, suggestions, or important notes:
- [Any unexpected behavior observed]
- [Performance notes]
- [Usability observations]
- [Suggestions for improvement]

## Retest Information (if applicable)
- **Retest Date**: [YYYY-MM-DD]
- **Retest Status**: [Pass/Fail]
- **Changes Made**: [What was fixed]
- **Retest Notes**: [Additional observations]

---

## Sample Test Case: Login with Valid Credentials

### Test Case Information
- **Test Case ID**: BT-AUTH-001
- **Test Case Title**: Verify user login with valid credentials
- **Module**: Authentication
- **Priority**: High
- **Test Type**: Functional
- **Test Method**: Black Box Testing

### Test Environment
- **Browser**: Chrome Version 119.0
- **Operating System**: Windows 11
- **Device**: Desktop
- **Screen Resolution**: 1920x1080
- **Network**: WiFi

### Preconditions
- [x] Application is accessible at http://localhost:8000
- [x] Database contains test user account
- [x] Browser cache is cleared
- [x] No user is currently logged in

### Test Data
```
Test Account:
- Email: admin@test.com
- Password: TestAdmin123!
- Role: admin
```

### Test Steps
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to http://localhost:8000 | Login page is displayed |
| 2 | Enter email: admin@test.com | Email field accepts input |
| 3 | Enter password: TestAdmin123! | Password field accepts input (masked) |
| 4 | Click "Masuk" button | Login process initiates |
| 5 | Verify redirect | User redirected to dashboard |

### Expected Results
- User successfully authenticates
- Redirected to dashboard page
- User name displayed in header
- Logout option available
- Dashboard statistics visible

### Actual Results
- ✅ Login successful
- ✅ Redirected to /dashboard
- ✅ User name "Admin" displayed in header
- ✅ Logout button visible
- ✅ Dashboard loaded with statistics

### Test Evidence
- [x] Screenshot 1: Login page - `login-page-initial.png`
- [x] Screenshot 2: Credentials entered - `login-credentials-entered.png`
- [x] Screenshot 3: Dashboard after login - `login-success-dashboard.png`

### Test Status
- **Status**: Pass
- **Execution Date**: 2024-10-13
- **Execution Time**: 09:15 - 09:18
- **Executed By**: QA Team
- **Reviewed By**: Test Lead

### Comments/Notes
- Login process completed in <2 seconds
- Dashboard loaded quickly with all statistics
- UI responsive and user-friendly
- No console errors observed
