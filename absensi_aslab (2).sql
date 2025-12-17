-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 17, 2025 at 12:49 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `absensi_aslab`
--

-- --------------------------------------------------------

--
-- Table structure for table `absensi_praktikums`
--

CREATE TABLE `absensi_praktikums` (
  `id` bigint UNSIGNED NOT NULL,
  `aslab_id` bigint UNSIGNED NOT NULL,
  `tanggal` date NOT NULL,
  `dosen_praktikum_id` bigint UNSIGNED NOT NULL,
  `pertemuan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sebagai` enum('instruktur','asisten') COLLATE utf8mb4_unicode_ci NOT NULL,
  `kehadiran_dosen` enum('hadir','tidak_hadir') COLLATE utf8mb4_unicode_ci NOT NULL,
  `kelas_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `aset_aslabs`
--

CREATE TABLE `aset_aslabs` (
  `id` bigint UNSIGNED NOT NULL,
  `nama_aset` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_id` bigint UNSIGNED NOT NULL,
  `kode_aset` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nomor_seri` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stok` int NOT NULL,
  `status` enum('baik','kurang_baik','tidak_baik','dipinjam','sudah_dikembalikan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'baik',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `gambar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendances`
--

CREATE TABLE `attendances` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `type` enum('check_in','check_out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL,
  `date` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bahan`
--

CREATE TABLE `bahan` (
  `id` bigint UNSIGNED NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_bahan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stok` int NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `gambar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dosen_mata_kuliah`
--

CREATE TABLE `dosen_mata_kuliah` (
  `id` bigint UNSIGNED NOT NULL,
  `dosen_praktikum_id` bigint UNSIGNED NOT NULL,
  `mata_kuliah_praktikum_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dosen_praktikums`
--

CREATE TABLE `dosen_praktikums` (
  `id` bigint UNSIGNED NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nidn` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jenis_aset_aslabs`
--

CREATE TABLE `jenis_aset_aslabs` (
  `id` bigint UNSIGNED NOT NULL,
  `nama_jenis_aset` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id` bigint UNSIGNED NOT NULL,
  `kelas` int NOT NULL,
  `jurusan` enum('IF','SI') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mata_kuliah_praktikums`
--

CREATE TABLE `mata_kuliah_praktikums` (
  `id` bigint UNSIGNED NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kelas_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `related_model_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_model_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman_aset`
--

CREATE TABLE `peminjaman_aset` (
  `id` bigint UNSIGNED NOT NULL,
  `aset_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `stok` int NOT NULL,
  `tanggal_pinjam` datetime NOT NULL,
  `tanggal_kembali` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected','borrowed','returned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approval_note` text COLLATE utf8mb4_unicode_ci,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `agreement_accepted` tinyint(1) NOT NULL DEFAULT '0',
  `manual_borrower_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manual_borrower_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manual_borrower_class` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_return_date` datetime DEFAULT NULL,
  `bahan_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `penggunaan_bahan`
--

CREATE TABLE `penggunaan_bahan` (
  `id` bigint UNSIGNED NOT NULL,
  `bahan_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `tanggal_penggunaan` datetime NOT NULL,
  `jumlah_digunakan` int NOT NULL,
  `keperluan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `github_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rfid_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_chat_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `prodi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `role` enum('admin','aslab','mahasiswa','dosen') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'mahasiswa',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `piket_day` enum('senin','selasa','rabu','kamis','jumat') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `absensi_praktikums`
--
ALTER TABLE `absensi_praktikums`
  ADD PRIMARY KEY (`id`),
  ADD KEY `absensi_praktikums_dosen_praktikum_id_foreign` (`dosen_praktikum_id`),
  ADD KEY `absensi_praktikums_kelas_id_foreign` (`kelas_id`),
  ADD KEY `absensi_praktikums_tanggal_kelas_id_index` (`tanggal`,`kelas_id`),
  ADD KEY `absensi_praktikums_aslab_id_tanggal_index` (`aslab_id`,`tanggal`);

--
-- Indexes for table `aset_aslabs`
--
ALTER TABLE `aset_aslabs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aset_aslabs_jenis_id_foreign` (`jenis_id`),
  ADD KEY `idx_aset_nama` (`nama_aset`),
  ADD KEY `idx_aset_kode` (`kode_aset`),
  ADD KEY `idx_aset_stok` (`stok`),
  ADD KEY `idx_aset_status` (`status`),
  ADD KEY `idx_aset_nama_stok` (`nama_aset`,`stok`),
  ADD KEY `idx_aset_kode_stok` (`kode_aset`,`stok`);

--
-- Indexes for table `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendances_user_id_date_index` (`user_id`,`date`),
  ADD KEY `attendances_date_type_index` (`date`,`type`);

--
-- Indexes for table `bahan`
--
ALTER TABLE `bahan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bahan_nama` (`nama`),
  ADD KEY `idx_bahan_jenis` (`jenis_bahan`),
  ADD KEY `idx_bahan_stok` (`stok`),
  ADD KEY `idx_bahan_nama_stok` (`nama`,`stok`),
  ADD KEY `idx_bahan_jenis_stok` (`jenis_bahan`,`stok`);

--
-- Indexes for table `dosen_mata_kuliah`
--
ALTER TABLE `dosen_mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dosen_mata_kuliah_mata_kuliah_praktikum_id_foreign` (`mata_kuliah_praktikum_id`),
  ADD KEY `dosen_matkul_index` (`dosen_praktikum_id`,`mata_kuliah_praktikum_id`);

--
-- Indexes for table `dosen_praktikums`
--
ALTER TABLE `dosen_praktikums`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dosen_praktikums_nidn_unique` (`nidn`),
  ADD KEY `dosen_praktikums_nidn_index` (`nidn`);

--
-- Indexes for table `jenis_aset_aslabs`
--
ALTER TABLE `jenis_aset_aslabs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `jenis_aset_aslabs_nama_jenis_aset_unique` (`nama_jenis_aset`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mata_kuliah_praktikums`
--
ALTER TABLE `mata_kuliah_praktikums`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mata_kuliah_praktikums_kelas_id_foreign` (`kelas_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_read_at_index` (`user_id`,`read_at`),
  ADD KEY `notifications_related_model_type_related_model_id_index` (`related_model_type`,`related_model_id`);

--
-- Indexes for table `peminjaman_aset`
--
ALTER TABLE `peminjaman_aset`
  ADD PRIMARY KEY (`id`),
  ADD KEY `peminjaman_aset_aset_id_foreign` (`aset_id`),
  ADD KEY `peminjaman_aset_user_id_foreign` (`user_id`),
  ADD KEY `peminjaman_aset_approved_by_foreign` (`approved_by`),
  ADD KEY `peminjaman_aset_bahan_id_foreign` (`bahan_id`);

--
-- Indexes for table `penggunaan_bahan`
--
ALTER TABLE `penggunaan_bahan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `penggunaan_bahan_bahan_id_foreign` (`bahan_id`),
  ADD KEY `penggunaan_bahan_user_id_foreign` (`user_id`),
  ADD KEY `penggunaan_bahan_approved_by_foreign` (`approved_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_rfid_code_unique` (`rfid_code`),
  ADD UNIQUE KEY `users_google_id_unique` (`google_id`),
  ADD UNIQUE KEY `users_github_id_unique` (`github_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `absensi_praktikums`
--
ALTER TABLE `absensi_praktikums`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `aset_aslabs`
--
ALTER TABLE `aset_aslabs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bahan`
--
ALTER TABLE `bahan`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dosen_mata_kuliah`
--
ALTER TABLE `dosen_mata_kuliah`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dosen_praktikums`
--
ALTER TABLE `dosen_praktikums`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jenis_aset_aslabs`
--
ALTER TABLE `jenis_aset_aslabs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mata_kuliah_praktikums`
--
ALTER TABLE `mata_kuliah_praktikums`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `peminjaman_aset`
--
ALTER TABLE `peminjaman_aset`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `penggunaan_bahan`
--
ALTER TABLE `penggunaan_bahan`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `absensi_praktikums`
--
ALTER TABLE `absensi_praktikums`
  ADD CONSTRAINT `absensi_praktikums_aslab_id_foreign` FOREIGN KEY (`aslab_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `absensi_praktikums_dosen_praktikum_id_foreign` FOREIGN KEY (`dosen_praktikum_id`) REFERENCES `dosen_praktikums` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `absensi_praktikums_kelas_id_foreign` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `aset_aslabs`
--
ALTER TABLE `aset_aslabs`
  ADD CONSTRAINT `aset_aslabs_jenis_id_foreign` FOREIGN KEY (`jenis_id`) REFERENCES `jenis_aset_aslabs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `attendances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dosen_mata_kuliah`
--
ALTER TABLE `dosen_mata_kuliah`
  ADD CONSTRAINT `dosen_mata_kuliah_dosen_praktikum_id_foreign` FOREIGN KEY (`dosen_praktikum_id`) REFERENCES `dosen_praktikums` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `dosen_mata_kuliah_mata_kuliah_praktikum_id_foreign` FOREIGN KEY (`mata_kuliah_praktikum_id`) REFERENCES `mata_kuliah_praktikums` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mata_kuliah_praktikums`
--
ALTER TABLE `mata_kuliah_praktikums`
  ADD CONSTRAINT `mata_kuliah_praktikums_kelas_id_foreign` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `peminjaman_aset`
--
ALTER TABLE `peminjaman_aset`
  ADD CONSTRAINT `peminjaman_aset_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `peminjaman_aset_aset_id_foreign` FOREIGN KEY (`aset_id`) REFERENCES `aset_aslabs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `peminjaman_aset_bahan_id_foreign` FOREIGN KEY (`bahan_id`) REFERENCES `bahan` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `peminjaman_aset_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `penggunaan_bahan`
--
ALTER TABLE `penggunaan_bahan`
  ADD CONSTRAINT `penggunaan_bahan_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `penggunaan_bahan_bahan_id_foreign` FOREIGN KEY (`bahan_id`) REFERENCES `bahan` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `penggunaan_bahan_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
