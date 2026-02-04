# Sequence Diagram

## 1. Sequence Diagram Login

Sequence diagram login menggambarkan interaksi antara user, sistem, dan database dalam proses autentikasi. User mengirimkan data email dan password ke sistem, kemudian sistem melakukan validasi dan mengecek kredensial ke database. Jika gagal, sistem menampilkan pesan error. Jika berhasil, sistem membuat session dan mengarahkan user ke dashboard.

![Sequence Diagram Login](diagrams/sequence/login_sequence.png)

**Gambar 4.X** Sequence Diagram Login

## 2. Sequence Diagram Registrasi

Sequence diagram registrasi menggambarkan interaksi antara user, sistem, dan database dalam proses pendaftaran akun. User mengirimkan data nama, email, dan password ke sistem, kemudian sistem melakukan validasi dan mengecek ketersediaan email di database. Jika gagal, sistem menampilkan pesan error. Jika berhasil, sistem menyimpan data user baru, membuat session, dan mengarahkan user ke dashboard.

![Sequence Diagram Register](diagrams/sequence/register_sequence.png)

**Gambar 4.X** Sequence Diagram Registrasi
