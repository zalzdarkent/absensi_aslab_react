# Activity Diagram

## 1. Activity Diagram Login

Activity diagram login menggambarkan alur proses autentikasi pengguna ke dalam sistem. Proses dimulai ketika pengguna mengakses halaman login, kemudian sistem menampilkan form login yang berisi field email dan password. Setelah pengguna mengisi data dan menekan tombol login, sistem akan melakukan validasi terhadap input yang diberikan.

Jika input tidak valid (format email salah atau field kosong), sistem akan menampilkan pesan error dan proses berhenti. Namun jika input valid, sistem akan melanjutkan dengan mengecek kredensial pengguna di database. Apabila email atau password tidak cocok, sistem menampilkan pesan error "Email atau Password Salah". Jika kredensial valid, sistem akan membuat session baru dan mengarahkan pengguna ke halaman dashboard.

![Activity Diagram Login](diagrams/activity/login.png)

**Gambar 4.X** Activity Diagram Login

## 2. Activity Diagram Registrasi

Activity diagram registrasi menggambarkan alur proses pendaftaran akun baru pada sistem. Proses dimulai ketika pengguna mengakses halaman registrasi, kemudian sistem menampilkan form registrasi yang berisi field nama, email, dan password. Setelah pengguna mengisi seluruh data dan menekan tombol register, sistem akan melakukan validasi terhadap input yang diberikan.

Jika input tidak valid (format tidak sesuai atau field kosong), sistem akan menampilkan pesan error dan proses berhenti. Namun jika input valid, sistem akan mengecek apakah email sudah terdaftar di database. Apabila email sudah digunakan oleh pengguna lain, sistem menampilkan pesan error "Email sudah digunakan". Jika email belum terdaftar, sistem akan menyimpan data pengguna baru ke database, membuat session, dan mengarahkan pengguna ke halaman dashboard.

![Activity Diagram Register](diagrams/activity/register.png)

**Gambar 4.X** Activity Diagram Registrasi
