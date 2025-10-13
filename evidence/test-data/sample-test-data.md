# Sample Test Accounts dan Data

## Test User Accounts

### Administrator Accounts
```json
{
  "admin_primary": {
    "email": "admin@test.aslab.com",
    "password": "AdminTest123!",
    "name": "Test Administrator",
    "role": "admin",
    "status": "active",
    "created_for": "Primary admin testing"
  },
  "admin_secondary": {
    "email": "admin2@test.aslab.com", 
    "password": "AdminTest456!",
    "name": "Secondary Admin",
    "role": "admin",
    "status": "active",
    "created_for": "Multi-admin scenario testing"
  }
}
```

### Asisten Lab Accounts
```json
{
  "aslab_informatika": {
    "email": "aslab.if@test.aslab.com",
    "password": "AslabTest123!",
    "name": "Aslab Informatika",
    "role": "aslab",
    "prodi": "Informatika",
    "semester": 6,
    "rfid_code": "TEST001234",
    "status": "active"
  },
  "aslab_sistem": {
    "email": "aslab.si@test.aslab.com",
    "password": "AslabTest456!",
    "name": "Aslab Sistem Informasi",
    "role": "aslab", 
    "prodi": "Sistem Informasi",
    "semester": 8,
    "rfid_code": "TEST001235",
    "status": "active"
  }
}
```

### Student Accounts
```json
{
  "student_if": {
    "email": "student.if@test.aslab.com",
    "password": "StudentTest123!",
    "name": "Student Informatika",
    "role": "student",
    "prodi": "Informatika",
    "semester": 4,
    "status": "active"
  },
  "student_si": {
    "email": "student.si@test.aslab.com",
    "password": "StudentTest456!",
    "name": "Student Sistem Informasi", 
    "role": "student",
    "prodi": "Sistem Informasi",
    "semester": 2,
    "status": "active"
  }
}
```

## RFID Test Cards

### Active Cards
```json
{
  "card_001": {
    "rfid_code": "TEST001234",
    "assigned_to": "aslab.if@test.aslab.com",
    "status": "active",
    "issued_date": "2024-10-01",
    "purpose": "Primary RFID testing"
  },
  "card_002": {
    "rfid_code": "TEST001235", 
    "assigned_to": "aslab.si@test.aslab.com",
    "status": "active",
    "issued_date": "2024-10-01",
    "purpose": "Secondary RFID testing"
  },
  "card_003": {
    "rfid_code": "TEST001236",
    "assigned_to": null,
    "status": "unassigned",
    "issued_date": "2024-10-01",
    "purpose": "Unassigned card testing"
  }
}
```

### Inactive/Test Cards
```json
{
  "card_inactive": {
    "rfid_code": "TEST999999",
    "assigned_to": null,
    "status": "inactive",
    "purpose": "Testing inactive card scenarios"
  },
  "card_invalid": {
    "rfid_code": "INVALID001",
    "assigned_to": null,
    "status": "invalid",
    "purpose": "Testing invalid card format"
  }
}
```

## Sample Asset Data

### Laboratory Equipment
```json
{
  "laptop_001": {
    "name": "Laptop ASUS ROG",
    "category": "Komputer",
    "code": "LAB-LT-001",
    "status": "available",
    "condition": "baik",
    "location": "Lab Informatika",
    "value": 15000000
  },
  "projector_001": {
    "name": "Projector Epson EB-X41",
    "category": "Proyektor", 
    "code": "LAB-PJ-001",
    "status": "available",
    "condition": "baik",
    "location": "Lab Multimedia",
    "value": 8000000
  },
  "arduino_kit": {
    "name": "Arduino Uno R3 Kit",
    "category": "Mikrokontroller",
    "code": "LAB-AR-001", 
    "status": "borrowed",
    "condition": "baik",
    "location": "Lab Embedded",
    "borrowed_by": "aslab.if@test.aslab.com",
    "value": 500000
  }
}
```

### Laboratory Materials
```json
{
  "resistor_pack": {
    "name": "Resistor Pack 1K-10K Ohm",
    "category": "Komponen Elektronik",
    "code": "MAT-RS-001",
    "quantity": 100,
    "unit": "pcs",
    "status": "available",
    "location": "Gudang Komponen"
  },
  "breadboard": {
    "name": "Breadboard 830 Point",
    "category": "Komponen Elektronik", 
    "code": "MAT-BB-001",
    "quantity": 25,
    "unit": "pcs",
    "status": "available",
    "location": "Lab Elektronika"
  }
}
```

## Test Scenarios Data

### Attendance Test Scenarios
```json
{
  "normal_checkin": {
    "user": "aslab.if@test.aslab.com",
    "rfid": "TEST001234",
    "time": "08:00:00",
    "expected": "success",
    "description": "Normal check-in di jam kerja"
  },
  "late_checkin": {
    "user": "aslab.if@test.aslab.com", 
    "rfid": "TEST001234",
    "time": "10:30:00",
    "expected": "success_with_late_flag",
    "description": "Check-in terlambat setelah jam 10:00"
  },
  "duplicate_checkin": {
    "user": "aslab.if@test.aslab.com",
    "rfid": "TEST001234", 
    "time": "08:00:00",
    "action": "checkin_twice_same_day",
    "expected": "error_duplicate",
    "description": "Prevent duplicate check-in pada hari yang sama"
  }
}
```

### Asset Management Test Scenarios
```json
{
  "borrow_available": {
    "user": "aslab.if@test.aslab.com",
    "asset": "LAB-LT-001",
    "duration": 7,
    "expected": "success",
    "description": "Peminjaman asset yang tersedia"
  },
  "borrow_unavailable": {
    "user": "aslab.si@test.aslab.com",
    "asset": "LAB-AR-001", 
    "duration": 3,
    "expected": "error_not_available",
    "description": "Peminjaman asset yang sedang dipinjam"
  },
  "return_asset": {
    "user": "aslab.if@test.aslab.com",
    "asset": "LAB-AR-001",
    "condition": "baik",
    "expected": "success",
    "description": "Pengembalian asset dalam kondisi baik"
  }
}
```

## Boundary Value Test Data

### Input Validation Data
```json
{
  "email_valid": [
    "test@example.com",
    "user.name@domain.co.id",
    "admin123@university.ac.id"
  ],
  "email_invalid": [
    "invalid-email",
    "@domain.com",
    "user@",
    "user name@domain.com"
  ],
  "password_valid": [
    "Password123!",
    "SecureP@ss1",
    "MyStrongP@ssw0rd"
  ],
  "password_invalid": [
    "123",
    "password",
    "PASSWORD123",
    "Pass123"
  ],
  "name_boundary": {
    "valid_min": "Jo",
    "valid_max": "A".repeat(100),
    "invalid_short": "J",
    "invalid_long": "A".repeat(101)
  }
}
```

## Performance Test Data

### Load Testing Scenarios
```json
{
  "concurrent_login": {
    "users": 50,
    "duration": "5 minutes",
    "expected_response": "<3 seconds",
    "description": "50 user login bersamaan"
  },
  "rfid_scanning_load": {
    "scans_per_minute": 30,
    "duration": "10 minutes", 
    "expected_response": "<1 second",
    "description": "High frequency RFID scanning"
  },
  "report_generation": {
    "data_range": "6 months",
    "users": 10,
    "expected_response": "<30 seconds",
    "description": "Large report generation dengan multiple users"
  }
}
```

## Browser Compatibility Matrix

### Test Browser Versions
```json
{
  "chrome": {
    "versions": ["119", "120", "121"],
    "features_to_test": ["login", "dashboard", "rfid", "reports"],
    "expected": "full_compatibility"
  },
  "firefox": {
    "versions": ["118", "119", "120"],
    "features_to_test": ["login", "dashboard", "rfid", "reports"], 
    "expected": "full_compatibility"
  },
  "safari": {
    "versions": ["16", "17"],
    "features_to_test": ["login", "dashboard", "rfid", "reports"],
    "expected": "minor_rfid_issues",
    "known_issues": ["RFID scanner connection intermittent"]
  },
  "edge": {
    "versions": ["119", "120"],
    "features_to_test": ["login", "dashboard", "rfid", "reports"],
    "expected": "full_compatibility"
  }
}
```

## Mobile Device Testing Matrix

### Test Devices
```json
{
  "iphone_14": {
    "resolution": "390x844",
    "browser": "Safari",
    "features": ["responsive_layout", "touch_navigation", "forms"],
    "expected": "full_functionality"
  },
  "samsung_galaxy_s23": {
    "resolution": "360x780", 
    "browser": "Chrome",
    "features": ["responsive_layout", "touch_navigation", "forms"],
    "expected": "full_functionality"
  },
  "ipad_air": {
    "resolution": "820x1180",
    "browser": "Safari", 
    "features": ["responsive_layout", "tablet_layout", "forms"],
    "expected": "optimized_tablet_view"
  }
}
```

---

**Note:** Data ini adalah sample untuk keperluan testing. Jangan gunakan dalam environment production.

**Security Notice:** Semua password dan data sensitif dalam file ini hanya untuk testing. Ganti dengan data production yang aman saat deployment.
