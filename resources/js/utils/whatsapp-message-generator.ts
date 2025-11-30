interface BorrowingData {
    manual_borrower_name?: string;
    nama_aset?: string;
    nama_barang?: string;
    jumlah: number;
    tanggal_pinjam: string;
    target_return_date?: string | null;
}

/**
 * Format date to Indonesian locale
 */
const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';
    try {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

/**
 * Generate WhatsApp reminder message based on return date status
 */
export const generateWhatsAppReminderMessage = (data: BorrowingData): string => {
    const borrowerName = data.manual_borrower_name || 'Peminjam';
    const itemName = (data.nama_aset && data.nama_aset !== 'N/A')
        ? data.nama_aset
        : (data.nama_barang && data.nama_barang !== 'N/A')
            ? data.nama_barang
            : 'barang';
    const quantity = data.jumlah;
    const borrowDate = formatDate(data.tanggal_pinjam);
    const targetDate = data.target_return_date ? formatDate(data.target_return_date) : 'belum ditentukan';

    let message = '';

    if (data.target_return_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(data.target_return_date);
        target.setHours(0, 0, 0, 0);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            // Sudah terlambat
            const lateDays = Math.abs(diffDays);
            message = `Halo ${borrowerName},

Kami dari Laboratorium mengingatkan bahwa peminjaman barang Anda sudah *TERLAMBAT ${lateDays} hari*.

*Detail Peminjaman:*
- Barang: ${itemName}
- Jumlah: ${quantity} unit
- Tanggal Pinjam: ${borrowDate}
- Target Kembali: ${targetDate}
- Status: *TERLAMBAT ${lateDays} HARI*

*Mohon SEGERA mengembalikan barang yang dipinjam hari ini.* Keterlambatan dapat mengganggu jadwal peminjaman lainnya.

Jika ada kendala atau kesulitan mengembalikan, segera hubungi kami.

Terima kasih atas pengertiannya.`;
        } else if (diffDays === 0) {
            // Hari ini target pengembalian
            message = `Halo ${borrowerName},

Kami dari Laboratorium mengingatkan bahwa *HARI INI* adalah target pengembalian barang yang Anda pinjam.

*Detail Peminjaman:*
- Barang: ${itemName}
- Jumlah: ${quantity} unit
- Tanggal Pinjam: ${borrowDate}
- Target Kembali: ${targetDate} (*HARI INI*)

Mohon mengembalikan barang pada hari ini sesuai jadwal. Jika belum bisa mengembalikan hari ini, harap konfirmasi kepada kami.

Terima kasih atas kerjasamanya!`;
        } else if (diffDays === 1) {
            // Besok target pengembalian
            message = `Halo ${borrowerName},

Kami dari Laboratorium mengingatkan bahwa *BESOK* adalah target pengembalian barang yang Anda pinjam.

*Detail Peminjaman:*
- Barang: ${itemName}
- Jumlah: ${quantity} unit
- Tanggal Pinjam: ${borrowDate}
- Target Kembali: ${targetDate} (*BESOK*)

Mohon persiapkan untuk mengembalikan barang besok sesuai jadwal. Jika ada kendala, silakan hubungi kami.

Terima kasih!`;
        } else {
            // Masih ada waktu
            message = `Halo ${borrowerName},

Kami dari Laboratorium ingin mengingatkan tentang peminjaman barang:

*Detail Peminjaman:*
- Barang: ${itemName}
- Jumlah: ${quantity} unit
- Tanggal Pinjam: ${borrowDate}
- Target Kembali: ${targetDate} (${diffDays} hari lagi)

Mohon untuk mengembalikan barang sesuai jadwal. Jika ada kendala, silakan hubungi kami.

Terima kasih atas perhatian dan kerjasamanya!`;
        }
    } else {
        // Tidak ada target date
        message = `Halo ${borrowerName},

Kami dari Laboratorium ingin mengingatkan tentang peminjaman barang:

*Detail Peminjaman:*
- Barang: ${itemName}
- Jumlah: ${quantity} unit
- Tanggal Pinjam: ${borrowDate}
- Target Kembali: Belum ditentukan

Mohon segera mengembalikan barang yang dipinjam. Jika ada kendala, silakan hubungi kami.

Terima kasih atas perhatian dan kerjasamanya!`;
    }

    return encodeURIComponent(message);
};

/**
 * Format phone number for WhatsApp (remove spaces, dashes, and leading zeros)
 */
export const formatPhoneForWhatsApp = (phone: string): string => {
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If starts with 0, replace with 62 (Indonesia country code)
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }

    // Remove + sign for wa.me format
    cleaned = cleaned.replace('+', '');

    // If doesn't start with country code, assume Indonesia and add 62
    if (!cleaned.startsWith('62') && cleaned.length >= 9) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
};
