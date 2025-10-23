# VPS Firewall Configuration Guide

## Port yang Perlu Dibuka di VPS

### 1. Essential Ports (WAJIB)
```bash
# SSH (untuk remote access)
sudo ufw allow 22/tcp

# HTTP (port 80 - akan redirect ke HTTPS)
sudo ufw allow 80/tcp

# HTTPS (port 443 - main application)
sudo ufw allow 443/tcp
```

### 2. Optional Ports (OPSIONAL)
```bash
# PHPMyAdmin (jika diperlukan akses dari luar)
# PERINGATAN: Sebaiknya hanya buka untuk IP tertentu
sudo ufw allow from YOUR_IP_ADDRESS to any port 8080

# Atau buka untuk semua (TIDAK DISARANKAN untuk production)
sudo ufw allow 8080/tcp
```

### 3. Ports yang TIDAK BOLEH Dibuka (Internal Only)
```
- 3306 (MySQL) - sudah aman, hanya internal Docker
- 6379 (Redis) - sudah aman, hanya internal Docker  
- 9000 (PHP-FPM) - sudah aman, hanya internal Docker
- 5090 (Reverb) - sudah aman, proxy via nginx
```

## Enable UFW
```bash
sudo ufw enable
sudo ufw status verbose
```

## Contoh Output yang Benar:
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
8080/tcp                   ALLOW IN    YOUR_IP_ADDRESS
```

## Security Best Practices:

1. **Batasi akses PHPMyAdmin:**
   ```bash
   # Hanya izinkan IP tertentu
   sudo ufw allow from YOUR_IP_ADDRESS to any port 8080
   ```

2. **Monitor logs:**
   ```bash
   tail -f /var/log/ufw.log
   ```

3. **Backup firewall rules:**
   ```bash
   sudo ufw --dry-run disable
   ```
