@echo off
echo ===============================================
echo    Telegram Bot Webhook Setup dengan ngrok
echo ===============================================
echo.

echo 1. Pastikan Laravel development server berjalan di port 8000
echo    Command: php artisan serve --host=0.0.0.0 --port=8000
echo.

echo 2. Install ngrok jika belum ada:
echo    Download dari: https://ngrok.com/download
echo    Extract dan tambahkan ke PATH
echo.

echo 3. Buat tunnel ngrok:
echo    Command: ngrok http 8000
echo.

echo 4. Copy URL ngrok (seperti: https://abc123.ngrok.io)
echo.

echo 5. Set webhook menggunakan URL ngrok:
echo    POST https://api.telegram.org/bot%TELEGRAM_BOT_TOKEN%/setWebhook
echo    Body: {"url": "https://abc123.ngrok.io/api/telegram/webhook/%TELEGRAM_BOT_TOKEN%"}
echo.

echo 6. Test bot dengan mengirim pesan /start di Telegram
echo.

echo ===============================================
echo            Langkah Manual Setup
echo ===============================================
echo.

echo A. Jalankan Laravel server:
echo    php artisan serve --host=0.0.0.0 --port=8000
echo.

echo B. Di terminal baru, jalankan ngrok:
echo    ngrok http 8000
echo.

echo C. Copy HTTPS URL dari ngrok output
echo.

echo D. Jalankan script PHP ini dengan URL ngrok:
echo    php set_webhook_ngrok.php https://abc123.ngrok.io
echo.

pause
