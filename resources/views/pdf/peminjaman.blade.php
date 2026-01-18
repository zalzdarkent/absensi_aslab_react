<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Surat Peminjaman Barang - {{ $peminjaman['id'] }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .kop-table {
            width: 100%;
            border-bottom: 2px solid #000;
            margin-bottom: 20px;
            padding-bottom: 10px;
        }
        .kop-logo {
            width: 90px;
            text-align: left;
            vertical-align: middle;
        }
        .kop-text {
            text-align: center;
            vertical-align: middle;
            padding-right: 90px;
        }
        .kop-text h1 {
            margin: 0;
            font-size: 13px;
            font-weight: normal;
            text-transform: uppercase;
        }
        .kop-text h2 {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .kop-text h3 {
            margin: 0;
            font-size: 15px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .kop-text p {
            margin: 2px 0;
            font-size: 9px;
            font-weight: normal;
        }
        .title {
            text-align: center;
            margin-bottom: 20px;
        }
        .title h2 {
            margin: 0;
            font-size: 14px;
            text-decoration: underline;
            font-weight: bold;
        }
        .section {
            margin-bottom: 15px;
        }
        .section-title {
            font-weight: bold;
            background-color: #f2f2f2;
            padding: 5px 10px;
            margin-bottom: 10px;
            border-left: 4px solid #333;
            text-transform: uppercase;
            font-size: 11px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table th, table td {
            padding: 8px 12px;
            text-align: left;
            border: 1px solid #ddd;
        }
        table th {
            background-color: #f9f9f9;
            width: 30%;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
        }
        .signature-table {
            width: 100%;
            border: none;
        }
        .signature-table td {
            border: none;
            width: 33%;
            text-align: center;
            vertical-align: top;
        }
        .signature-space {
            height: 60px;
        }
        .note {
            font-size: 9px;
            font-style: italic;
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 5px;
            color: #666;
        }
        .sig-box {
            margin: 5px auto;
            border: 1px dashed #ccc;
            padding: 6px;
            font-family: monospace;
            font-size: 8px;
            display: inline-block;
            background-color: #fcfcfc;
        }
    </style>
</head>
<body>
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                @php
                    \Carbon\Carbon::setLocale('id');
                    $gdEnabled = extension_loaded('gd');
                    $logoPath = public_path('img/logo_aslab.png');
                @endphp
                
                @if($gdEnabled && file_exists($logoPath))
                    <img src="{{ $logoPath }}" width="80" height="80">
                @else
                    {{-- Premium Text-based Fallback --}}
                    <div style="width: 80px; height: 80px; background-color: #000; color: #fff; text-align: center; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-family: 'Georgia', serif;">
                        <div style="font-size: 24px; font-weight: bold; line-height: 1; padding-top: 20px;">LAB<br><span style="font-size: 14px; opacity: 0.8;">KOM</span></div>
                    </div>
                @endif
            </td>
            <td class="kop-text">
                <h1>KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</h1>
                <h2>UNIVERSITAS SINGAPERBANGSA KARAWANG</h2>
                <h3>LABORATORIUM KOMPUTER<br>FAKULTAS ILMU KOMPUTER</h3>
                <p>Jl. H.S Ronggowaluyo Teluk Jambe Karawang 41361</p>
                <p>Email: labkom.fasilkom@unsika.ac.id Telp: +62 896 2289 4396</p>
            </td>
        </tr>
    </table>

    <div class="title">
        <h2>SURAT KETERANGAN PEMINJAMAN</h2>
        <p style="margin-top: 5px;">Kode Barang: #{{ $peminjaman['kode_barang'] }}</p>
    </div>

    <div class="section">
        <div class="section-title">I. INFORMASI PEMINJAM</div>
        <table>
            <tr>
                <th>Nama Peminjam</th>
                <td>{{ $peminjaman['nama_peminjam'] }}</td>
            </tr>
            @if($peminjaman['manual_borrower_name'])
            <tr>
                <th>Penerima (Manual)</th>
                <td>{{ $peminjaman['manual_borrower_name'] }}</td>
            </tr>
            @endif
            @if($peminjaman['manual_borrower_class'])
            <tr>
                <th>Kelas / Jurusan</th>
                <td>{{ $peminjaman['manual_borrower_class'] }}</td>
            </tr>
            @endif
            @if($peminjaman['manual_borrower_phone'])
            <tr>
                <th>No. WhatsApp</th>
                <td>{{ $peminjaman['manual_borrower_phone'] }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div class="section">
        <div class="section-title">II. RINCIAN BARANG & LOKASI</div>
        <table>
            <tr>
                <th>Nama Barang</th>
                <td><strong>{{ $peminjaman['nama_barang'] }}</strong></td>
            </tr>
            <tr>
                <th>Kode Barang</th>
                <td>{{ $peminjaman['kode_barang'] }}</td>
            </tr>
            <tr>
                <th>Tipe / Kategori</th>
                <td style="text-transform: capitalize;">{{ $peminjaman['tipe_barang'] }}</td>
            </tr>
            <tr>
                <th>Jumlah Dipinjam</th>
                <td>{{ $peminjaman['jumlah'] }} unit</td>
            </tr>
            <tr>
                <th>Lokasi Barang</th>
                <td>{{ $peminjaman['lokasi'] ?? 'Laboratorium Komputer' }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">III. JADWAL & STATUS</div>
        <table>
            <tr>
                <th>Tanggal Pinjam</th>
                <td>{{ \Carbon\Carbon::parse($peminjaman['tanggal_pinjam'])->translatedFormat('l, d F Y (H:i)') }} WIB</td>
            </tr>
            @if($peminjaman['target_return_date'])
            <tr>
                <th>Target Pengembalian</th>
                <td>{{ \Carbon\Carbon::parse($peminjaman['target_return_date'])->translatedFormat('l, d F Y (H:i)') }} WIB</td>
            </tr>
            @endif
            @if($peminjaman['tanggal_kembali'])
            <tr>
                <th>Aktual Dikembalikan</th>
                <td>{{ \Carbon\Carbon::parse($peminjaman['tanggal_kembali'])->translatedFormat('l, d F Y (H:i)') }} WIB</td>
            </tr>
            @endif
            <tr>
                <th>Status Saat Ini</th>
                <td>{{ $peminjaman['status_text'] }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">IV. KETERANGAN / KEPERLUAN</div>
        <div style="padding: 12px; border: 1px solid #ddd; min-height: 40px;">
            {{ $peminjaman['keterangan'] ?? 'Peminjaman rutin sarana laboratorium.' }}
        </div>
    </div>

    <div class="footer">
        <table class="signature-table">
            <tr>
                <td>
                    <p>Peminjam,</p>
                    <div class="signature-space"></div>
                    <p><strong>( {{ $peminjaman['manual_borrower_name'] ?? $peminjaman['nama_peminjam'] }} )</strong></p>
                </td>
                <td></td>
                <td>
                    <p>Karawang, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>Kepala Laboratorium,</p>
                    <div class="signature-space">
                        @if($peminjaman['approved_at'])
                            <div class="sig-box">
                                [ VERIFIED BY SYSTEM ]<br>
                                SIG: {{ strtoupper(substr(md5($peminjaman['approved_at']), 0, 12)) }}<br>
                                {{ date('d-m-Y H:i', strtotime($peminjaman['approved_at'])) }}
                            </div>
                        @endif
                    </div>
                    <p><strong>( {{ $peminjaman['approved_by'] ?? '..........................' }} )</strong></p>
                </td>
            </tr>
        </table>
    </div>

    <div class="note">
        <p><strong>Catatan Penting:</strong> Bukti peminjaman ini sah dikeluarkan oleh sistem. Peminjam bertanggung jawab penuh atas kondisi barang selama masa peminjaman. Kerusakan atau kehilangan barang wajib diganti sesuai dengan ketentuan yang berlaku di Laboratorium Komputer FIK UNSIKA.</p>
    </div>
</body>
</html>
