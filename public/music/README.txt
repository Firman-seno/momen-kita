FOLDER MUSIK UNDANGAN DIGITAL (/public/music/)
============================================

Folder ini disediakan sebagai lokasi penyimpanan file MP3 musik latar belakang untuk setiap template undangan digital (#001 - #400).

Struktur Penamaan File MP3:
- /public/music/template-001.mp3
- /public/music/template-002.mp3
- /public/music/template-057.mp3
- /public/music/template-081.mp3
- /public/music/template-100.mp3
...dan seterusnya.

Catatan: Saat ini seluruh 400 template sudah terhubung ke pustaka musik daring (Pixabay CDN) yang terverifikasi di src/data/musicLibrary.ts. File MP3 lokal di folder ini bersifat opsional sebagai sumber fallback tambahan.

Sistem Audio Web Application (MomenKita):
1. Ketika pengunjung membuka undangan (demo), sistem akan secara otomatis memutar lagu sesuai mood template (Birthday, Sunatan, Wedding, Aqiqah).
2. Jika audio daring gagal dimuat atau terjadi kendala jaringan, sistem otomatis beralih ke fallback URL kedua, lalu ke Polyphonic Synthesizer Engine dengan harmoni nada sesuai tema, sehingga suara musik SELALU TERDENGAR JELAS dan TIDAK AKAN PERNAH HENING.
3. Kontrol volume default disetel ke 0.35 dengan fitur Play/Pause, Mute/Unmute, serta mode Loop terus menerus. Musik tidak akan otomatis resume/membunyikan diri sendiri setelah pengguna menekan Pause.
