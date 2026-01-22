<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Surat Peminjaman - {{ $peminjaman['id'] }}</title>
    <style>
        @page {
            margin: 1cm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .kop-table {
            width: 100%;
            border: none;
            margin-bottom: 5px;
        }
        .kop-logo {
            width: 110px;
            text-align: left;
            vertical-align: middle;
        }
        .kop-text {
            text-align: center;
            vertical-align: middle;
            padding-right: 110px;
        }
        .kop-text h1 {
            margin: 0;
            font-size: 14px;
            font-weight: normal;
            text-transform: uppercase;
        }
        .kop-text h2 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .kop-text h3 {
            margin: 0;
            font-size: 17px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kop-text p {
            margin: 1px 0;
            font-size: 10px;
        }
        .line-separator {
            border-top: 2px solid #000;
            margin-bottom: 20px;
        }
        
        .info-section {
            margin-bottom: 25px;
            width: 100%;
        }
        .info-table {
            width: 100%;
            border: none;
        }
        .info-table td {
            padding: 2px 0;
            vertical-align: top;
        }
        .label {
            width: 140px;
            font-weight: bold;
        }
        .colon {
            width: 15px;
            text-align: center;
        }

        .main-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .main-table th, .main-table td {
            border: 1px solid #000;
            padding: 8px 10px;
            text-align: center;
        }
        .main-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-transform: uppercase;
        }
        .text-left {
            text-align: left !important;
        }
        
        .footer {
            margin-top: 40px;
            width: 100%;
        }
        .signature-table {
            width: 100%;
            border: none;
        }
        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
        }
        .sig-space {
            height: 70px;
        }
    </style>
</head>
<body>
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                @php
                    $logoPath = public_path('img/logo_aslab.png');
                @endphp
                @if(file_exists($logoPath))
                    <img src="{{ $logoPath }}" width="105" height="105">
                @endif
            </td>
            <td class="kop-text">
                <h1>KEMENTERIAN PENDIDIKAN TINGGI, SAINS,</h1>
                <h1>DAN TEKNOLOGI</h1>
                <h2>UNIVERSITAS SINGAPERBANGSA KARAWANG</h2>
                <h3>LABORATORIUM KOMPUTER<br>FAKULTAS ILMU KOMPUTER</h3>
                <p>Jl. H.S Ronggowaluyo Teluk Jambe Karawang 41361</p>
                <p>Email: <span style="color: blue; text-decoration: underline;">labkom.fasilkom@unsika.ac.id</span> Telp: +62 896 2289 4396</p>
            </td>
        </tr>
    </table>

    <div class="line-separator"></div>

    @php
        \Carbon\Carbon::setLocale('id');
        $namaPeminjam = $peminjaman['manual_borrower_name'] ?? $peminjaman['nama_peminjam'];
        $kelas = $peminjaman['manual_borrower_class'] ?? '-';
        $wa = $peminjaman['manual_borrower_phone'] ?? '-';
        
        $tglPinjam = \Carbon\Carbon::parse($peminjaman['tanggal_pinjam'])->translatedFormat('d F Y (H:i)');
        $tglKembali = $peminjaman['tanggal_kembali'] 
            ? \Carbon\Carbon::parse($peminjaman['tanggal_kembali'])->translatedFormat('d F Y (H:i)')
            : ($peminjaman['target_return_date'] 
                ? \Carbon\Carbon::parse($peminjaman['target_return_date'])->translatedFormat('d F Y (H:i)') . ' (Estimasi)'
                : '-');
    @endphp

    <div class="info-section">
        <h2 style="text-align: center; text-decoration: underline; margin-bottom: 20px;">SURAT PEMINJAMAN INVENTARIS</h2>
        
        <table class="info-table">
            <tr>
                <td class="label">Nama Peminjam</td>
                <td class="colon">:</td>
                <td>{{ $namaPeminjam }}</td>
            </tr>
            <tr>
                <td class="label">Kelas / Instansi</td>
                <td class="colon">:</td>
                <td>{{ $kelas }}</td>
            </tr>
            <tr>
                <td class="label">No. WhatsApp</td>
                <td class="colon">:</td>
                <td>{{ $wa }}</td>
            </tr>
            <tr>
                <td class="label">Waktu Peminjaman</td>
                <td class="colon">:</td>
                <td>{{ $tglPinjam }} s/d {{ $tglKembali }}</td>
            </tr>
            <tr>
                <td class="label">Keperluan</td>
                <td class="colon">:</td>
                <td>{{ $peminjaman['keterangan'] ?? 'Peminjaman rutin sarana laboratorium.' }}</td>
            </tr>
        </table>
    </div>

    <table class="main-table">
        <thead>
            <tr>
                <th style="width: 40px;">No</th>
                <th class="text-left">Nama Barang</th>
                <th style="width: 100px;">Jenis</th>
                <th style="width: 80px;">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td class="text-left">
                    <strong>{{ $peminjaman['nama_barang'] }}</strong><br>
                    <small>Kode: {{ $peminjaman['kode_barang'] }}</small>
                </td>
                <td style="text-transform: capitalize;">{{ $peminjaman['tipe_barang'] }}</td>
                <td>{{ $peminjaman['jumlah'] }} unit</td>
            </tr>
            {{-- Display extra rows if needed for bulk (future proof) --}}
        </tbody>
    </table>

    <div class="footer">
        <table class="signature-table">
            <tr>
                <td>
                    <p>Peminjam,</p>
                    <div class="sig-space"></div>
                    <p><strong>( {{ $namaPeminjam }} )</strong></p>
                </td>
                <td>
                    <p>Karawang, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>Mengetahui,</p>
                    <div class="sig-space">
                        @if($peminjaman['approved_at'])
                            <div style="font-size: 8px; border: 1px dashed #ccc; padding: 5px; display: inline-block; font-family: monospace;">
                                VERIFIED BY SYSTEM<br>
                                {{ \Carbon\Carbon::parse($peminjaman['approved_at'])->format('d/m/Y H:i') }}
                            </div>
                        @endif
                    </div>
                    <p><strong>( Purwantoro, M.Kom )</strong></p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>


