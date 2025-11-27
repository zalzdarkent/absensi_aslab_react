# 🤖 Setup n8n Local Development (Tanpa Docker)

## 📦 Install n8n

### Option 1: npm (Recommended)
```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start
```

### Option 2: npx (Tanpa install global)
```bash
# Langsung jalanin tanpa install
npx n8n
```

## ⚙️ Konfigurasi Database

### Setup Environment Variables
Buat file `.env.n8n` di folder project:

```env
# Database connection (pakai MySQL yang sama dengan Laravel)
DB_TYPE=mysqldb
DB_MYSQLDB_HOST=localhost
DB_MYSQLDB_PORT=3306
DB_MYSQLDB_DATABASE=n8n_local
DB_MYSQLDB_USER=root
DB_MYSQLDB_PASSWORD=password

# n8n Settings
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8n2025

# Webhook URL
WEBHOOK_URL=http://localhost:5678

# Timezone
GENERIC_TIMEZONE=Asia/Jakarta

# Disable telemetry
N8N_DIAGNOSTICS_ENABLED=false

# Port
N8N_PORT=5678
```

## 🗄️ Setup Database

1. **Create database di MySQL:**
```sql
CREATE DATABASE n8n_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Via phpMyAdmin** atau MySQL client yang kamu pakai

## 🚀 Start n8n

### Dengan environment file:
```bash
# Load environment variables dan start
set -a; source .env.n8n; set +a; n8n start
```

### Atau langsung dengan variables:
```bash
# Windows PowerShell
$env:DB_TYPE="mysqldb"
$env:DB_MYSQLDB_HOST="localhost" 
$env:DB_MYSQLDB_PORT="3306"
$env:DB_MYSQLDB_DATABASE="n8n_local"
$env:DB_MYSQLDB_USER="root"
$env:DB_MYSQLDB_PASSWORD="password"
$env:N8N_BASIC_AUTH_ACTIVE="true"
$env:N8N_BASIC_AUTH_USER="admin"
$env:N8N_BASIC_AUTH_PASSWORD="n8n2025"
$env:WEBHOOK_URL="http://localhost:5678"
$env:GENERIC_TIMEZONE="Asia/Jakarta"
npx n8n
```

## 🌐 Akses n8n

- **URL**: http://localhost:5678
- **Username**: admin
- **Password**: n8n2025

## 🎨 Visual Workflow Features (Yang kamu liat di sosmed)

### 1. **Real-time Flow Animation** ✨
- Saat workflow running, ada animasi yang menunjukkan data mengalir antar nodes
- Setiap step yang dieksekusi akan highlight dengan warna hijau
- Kalau error, node akan jadi merah

### 2. **Live Execution View** 🔴
- Klik tombol "Execute Workflow" untuk lihat live animation
- Data bisa di-inspect di setiap node
- Real-time logs dan output

### 3. **Workflow Canvas** 🎯
- Drag & drop nodes
- Visual connections antar nodes
- Zoom in/out dengan smooth animation

### 4. **Node Inspector** 🔍
- Klik node untuk lihat input/output data
- Preview data dalam bentuk JSON/Table
- Debug mode dengan step-by-step execution

### 5. **Execution History** 📊
- Timeline semua workflow executions
- Success/failure status dengan visual indicators
- Detailed logs untuk setiap run

## 🔗 Integrasi dengan Laravel

### 1. **Webhook dari Laravel ke n8n:**
```php
// Di Laravel Controller
$webhookUrl = 'http://localhost:5678/webhook/attendance-notification';
Http::post($webhookUrl, [
    'user_id' => $user->id,
    'type' => 'check_in',
    'timestamp' => now()
]);
```

### 2. **HTTP Request dari n8n ke Laravel:**
```json
{
  "method": "POST",
  "url": "http://localhost:8000/api/telegram/send-custom",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
  },
  "body": {
    "user_ids": [1, 2, 3],
    "message": "Reminder piket hari ini!"
  }
}
```

## 🎥 Demo Workflow Examples

### 1. **Attendance Notification Flow:**
```
[Webhook Trigger] 
    ↓
[Filter: Check user active] 
    ↓
[HTTP Request: Get user details] 
    ↓
[Set Variables: Format message] 
    ↓
[HTTP Request: Send Telegram]
    ↓
[Log Success]
```

### 2. **Daily Reminder Flow:**
```
[Cron Trigger: 07:00] 
    ↓
[HTTP Request: Get today's schedule] 
    ↓
[Split In Batches: Per user] 
    ↓
[Condition: User has telegram?] 
    ↓
[HTTP Request: Send reminder] 
    ↓
[Merge: Collect results]
```

## 💡 Tips untuk Development

1. **Test Mode**: Selalu test workflow dulu sebelum activate
2. **Error Handling**: Tambahkan error handling nodes
3. **Logging**: Gunakan "Set" node untuk logging intermediate data
4. **Webhook Testing**: Pakai Postman atau curl untuk test webhooks
5. **Variable Inspection**: Klik "Execute previous node" untuk debug step by step

## 🔥 Advanced Features

- **Sub-workflows**: Reusable workflow components
- **Conditional routing**: IF/ELSE logic dengan visual branching
- **Loop handling**: FOR loops dengan visual progress
- **Error recovery**: Automatic retry dengan backoff
- **Data transformation**: Built-in data manipulation tools

Animasi yang kamu liat di sosmed itu adalah real-time execution view ini! 🎯✨