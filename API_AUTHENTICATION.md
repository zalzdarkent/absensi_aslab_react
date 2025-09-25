# API Authentication Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication Endpoints

### 🔐 Public Routes (No Authentication Required)

#### 1. Login
**POST** `/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "prodi": "Informatika",
      "semester": 8,
      "is_active": true,
      "piket_day": "senin",
      "rfid_code": "ABC12345"
    },
    "token": "1|abc123def456...",
    "token_type": "Bearer",
    "expires_in": null
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

#### 2. Register
**POST** `/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "prodi": "Informatika",
  "semester": 6,
  "role": "aslab"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "aslab",
      "prodi": "Informatika",
      "semester": 6,
      "is_active": true
    },
    "token": "2|def456ghi789...",
    "token_type": "Bearer",
    "expires_in": null
  }
}
```

#### 3. Forgot Password
**POST** `/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Link reset password telah dikirim ke email Anda"
}
```

#### 4. Reset Password
**POST** `/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "email": "user@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password berhasil direset"
}
```

---

### 🔒 Protected Routes (Requires Authentication)

**Headers Required:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### 1. Get Current User
**GET** `/me`

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "prodi": "Informatika",
      "semester": 8,
      "is_active": true,
      "piket_day": "senin",
      "rfid_code": "ABC12345",
      "created_at": "2025-09-22T10:00:00.000000Z",
      "updated_at": "2025-09-22T10:00:00.000000Z"
    }
  }
}
```

#### 2. Logout
**POST** `/logout`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

#### 3. Refresh Token
**POST** `/refresh`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Token berhasil di-refresh",
  "data": {
    "token": "3|newtoken123...",
    "token_type": "Bearer",
    "expires_in": null
  }
}
```

#### 4. Change Password
**POST** `/change-password`

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

#### 5. Update Profile
**POST** `/update-profile`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "prodi": "Sistem Informasi",
  "semester": 7
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Profile berhasil diperbarui",
  "data": {
    "user": {
      "id": 1,
      "name": "Updated Name",
      "email": "updated@example.com",
      "role": "admin",
      "prodi": "Sistem Informasi",
      "semester": 7,
      "is_active": true,
      "piket_day": "senin",
      "rfid_code": "ABC12345"
    }
  }
}
```

#### 6. Get User Info
**GET** `/user`

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "prodi": "Informatika",
  "semester": 8,
  "is_active": true,
  "piket_day": "senin",
  "rfid_code": "ABC12345",
  "created_at": "2025-09-22T10:00:00.000000Z",
  "updated_at": "2025-09-22T10:00:00.000000Z"
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Usage Examples

### JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();

if (loginData.success) {
  const token = loginData.data.token;
  
  // Use token for authenticated requests
  const userResponse = await fetch('/api/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const userData = await userResponse.json();
  console.log(userData);
}
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get current user (with token)
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Content-Type: application/json"
```

---

## Notes
- All tokens are generated using Laravel Sanctum
- Tokens don't have expiration by default (can be configured)
- Multiple tokens per user are supported
- Logout only revokes the current token, not all user tokens
- Password reset requires email configuration in Laravel
- All endpoints return JSON responses
- CSRF protection is disabled for API routes
