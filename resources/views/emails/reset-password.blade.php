<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atur Ulang Kata Sandi</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
        }
        .header {
            padding: 32px;
            text-align: center;
            background-color: #ffffff;
            border-bottom: 1px solid #f3f4f6;
        }
        .content {
            padding: 40px;
            color: #1f2937;
            line-height: 1.6;
        }
        .footer {
            padding: 24px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            background-color: #f9fafb;
            border-top: 1px solid #f3f4f6;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 16px 0;
            letter-spacing: -0.025em;
        }
        p {
            margin: 0 0 24px 0;
            font-size: 16px;
            color: #4b5563;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #111827;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            text-align: center;
            transition: background-color 0.2s;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 32px 0;
        }
        .trouble {
            font-size: 13px;
            color: #9ca3af;
            word-break: break-all;
        }
        .trouble a {
            color: #3b82f6;
            text-decoration: none;
        }
        .logo {
            font-size: 20px;
            font-weight: 800;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LAB ASLAB</div>
        </div>
        <div class="content">
            <h1>Halo, {{ $name }}!</h1>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Jangan khawatir jika Anda lupa, hal itu sering terjadi!</p>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{ $url }}" class="button">Atur Ulang Kata Sandi</a>
            </div>

            <p>Tautan ini akan kedaluwarsa dalam 60 menit demi keamanan akun Anda.</p>
            <p>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan saja email ini. Kata sandi Anda tetap aman.</p>
            
            <div class="divider"></div>
            
            <p class="trouble">
                Jika tombol di atas tidak berfungsi, salin dan tempel alamat URL berikut ke browser Anda:<br>
                <a href="{{ $url }}">{{ $url }}</a>
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Sistem Absensi Aslab - Fasilkom Unsika.<br>
            Jl. HS.Ronggo Waluyo, Luar, Karawang Timur.
        </div>
    </div>
</body>
</html>
