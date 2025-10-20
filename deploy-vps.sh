#!/bin/bash

# VPS Deployment Script untuk Aslab Management System
# Jalankan script ini di VPS untuk deployment

set -e

echo "🚀 Starting VPS Deployment..."

# 1. Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Docker dan Docker Compose jika belum ada
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 3. Clone repository (jika belum ada)
if [ ! -d "absensi_aslab_react" ]; then
    echo "📁 Cloning repository..."
    git clone https://github.com/zalzdarkent/absensi_aslab_react.git
    cd absensi_aslab_react
else
    echo "📁 Updating repository..."
    cd absensi_aslab_react
    git pull origin main
fi

# 4. Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.production .env
    echo "❗ Please edit .env file with your production settings:"
    echo "   - APP_URL=https://your-domain.com"
    echo "   - REVERB_HOST=your-domain.com"
    echo "   - Database credentials"
    echo "   - Mail settings"
    read -p "Press Enter after editing .env file..."
fi

# 5. Generate SSL certificates untuk production
echo "🔒 Setting up SSL certificates..."
mkdir -p docker/nginx/ssl

# Generate self-signed cert (replace dengan Let's Encrypt di production)
if [ ! -f "docker/nginx/ssl/selfsigned.crt" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout docker/nginx/ssl/selfsigned.key \
        -out docker/nginx/ssl/selfsigned.crt \
        -subj "/C=ID/ST=WestJava/L=Karawang/O=Local/OU=Dev/CN=your-domain.com"
fi

# 6. Build dan start containers
echo "🏗️ Building and starting containers..."
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# 7. Setup Laravel
echo "🎯 Setting up Laravel..."
docker-compose -f docker-compose.production.yml exec -T app php artisan key:generate --force
docker-compose -f docker-compose.production.yml exec -T app php artisan migrate --force
docker-compose -f docker-compose.production.yml exec -T app php artisan db:seed --force
docker-compose -f docker-compose.production.yml exec -T app php artisan storage:link
docker-compose -f docker-compose.production.yml exec -T app php artisan config:cache
docker-compose -f docker-compose.production.yml exec -T app php artisan route:cache
docker-compose -f docker-compose.production.yml exec -T app php artisan view:cache

# 8. Set permissions
echo "🔐 Setting permissions..."
docker-compose -f docker-compose.production.yml exec -T app chown -R www-data:www-data /var/www/storage
docker-compose -f docker-compose.production.yml exec -T app chown -R www-data:www-data /var/www/bootstrap/cache

# 9. Check status
echo "✅ Checking container status..."
docker-compose -f docker-compose.production.yml ps

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Access Points:"
echo "   🌐 Main App: https://your-ip-address"
echo "   📊 PHPMyAdmin: http://your-ip-address:8080"
echo ""
echo "🔧 Next Steps:"
echo "   1. Update DNS records to point to this server"
echo "   2. Setup Let's Encrypt for real SSL certificates"
echo "   3. Configure firewall rules"
echo "   4. Setup monitoring and backups"
echo ""
echo "📝 Important Files:"
echo "   📄 Logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   🗂️ Environment: .env file"
echo ""
