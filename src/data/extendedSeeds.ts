import type { TemplateBadge } from "../types";

/* ============================================================
   EXTENDED SEEDS — 7 × 100 curated templates
   Tuple: [name, subcategory, designStyle, paletteKey, fontKey,
           illustrationStyle, badge?]
   Every name is unique so each template is one of a kind.
   ============================================================ */

type FontKey = "cute" | "playful" | "elegant" | "luxury" | "minimal" | "neon" | "retro" | "hand";

type ExtendedSeed = [string, string, string, string, FontKey, string, TemplateBadge?];

export interface ExtendedCategoryConfig {
  names: string[];
  subcats: string[];
  designs: string[];
  palettes: string[];
  fonts: FontKey[];
  illustrations: string[];
  badgeEvery?: number;
}

const buildSeeds = (cfg: ExtendedCategoryConfig): ExtendedSeed[] =>
  Array.from({ length: 100 }, (_, i) => {
    const subcategory = cfg.subcats[i % cfg.subcats.length];
    const designStyle = cfg.designs[(i * 7) % cfg.designs.length];
    const palette = cfg.palettes[(i * 3) % cfg.palettes.length];
    const font = cfg.fonts[(i * 2) % cfg.fonts.length];
    const illustration = cfg.illustrations[(i * 5) % cfg.illustrations.length];
    const badge =
      cfg.badgeEvery && i % cfg.badgeEvery === 0 ? (i % 2 === 0 ? "POPULAR" : "TRENDING") : undefined;
    return [cfg.names[i], subcategory, designStyle, palette, font, illustration, badge] as ExtendedSeed;
  });

/* ---------------- RELIGIOUS — Keagamaan ---------------- */
const RELIGIOUS_NAMES = [
  "Masjid Nabawi Elegance", "Cahaya Ramadhan", "Pengajian Akbar Nusantara", "Maulid Nabi Cahaya",
  "Isra Mi'raj Gemilang", "Kajian Ilmiah Subuh", "Halal Bihalal Keluarga", "Lailatul Qadar Malam",
  "Kemuliaan Muharram", "Cahaya Al-Quran", "Majelis Taklim Berkah", "Kuliah Subuh Syaban",
  "Peringatan Isra Mikraj", "Tabligh Akbar Iman", "Dzikir Dan Doa", "Majelis Sholawat",
  "Kalam Illahi", "Baitul Makmur", "Cahaya Hidayah", "Santunan Anak Yatim",
  "Sedekah Berkah", "Ceramah Perdana", "Kajian Kitab Kuning", "Majelis Ilmu",
  "Nuzulul Quran", "Malam Nisfu Syaban", "Halaqah Iman", "Majelis Dzikrul Ghafilin",
  "Sima'an Al-Quran", "Istighotsah Akbar", "Maulid Al Barzanji", "Diba'an Bersama",
  "Yasinan Bulanan", "Tahlil Bersama", "Kuliah Ba'da Maghrib", "Mengaji Pagi",
  "Tadarus Berjamaah", "Majelis Al-Fatihah", "Cahaya Nabawi", "Rasulullah Teladan",
  "Amalan Ramadhan", "Kajian Fiqih Wanita", "Majelis Ummahat", "Silaturahmi Umat",
  "Pesantren Kilat", "Ramadan Berkah", "Idul Fitri Mubarak", "Idul Adha Qurban",
  "Gemilang Arafah", "Takbiran Bersama", "Nisfu Malam Berkah", "Isra Mi'raj Nusantara",
  "Maulid Nusantara", "Rojab Berkah", "Syaban Penuh Doa", "Ramadhan Karim",
  "Lailatul Qadar Agung", "Zakat Fitrah", "Khutbah Jumat", "Ceramah Ahad",
  "Majelis Subuh", "Cahaya Fajar", "Barokah Ilmu", "Gema Sholawat",
  "Sholawat Nariyah", "Maulid Diba", "Al Barzanji Malam", "Doa Untuk Negeri",
  "Kebaikan Berbagi", "Amal Sholeh", "Iman Dan Taqwa", "Cahaya Tauhid",
  "Hijrah Berkah", "Bersihkan Hati", "Taubat Nasional", "Malam Kemuliaan",
  "Cahaya Masjid", "Suara Adzan", "Pesona Masjid", "Kiblat Hati",
  "Rindu Rasulullah", "Nurul Yaqin", "Cahaya Ikhlas", "Hikmah Ramadhan",
  "Lemah Lembut Iman", "Musafir Berkah", "Pondok Pesantren", "Santri Mandiri",
  "Santunan Dhuafa", "Bahagia Berbagi", "Indahnya Berbagi", "Sakinah Berkah",
  "Cahaya Cinta", "Malam Penuh Doa", "Jannah Di Hati", "Sabar Dan Syukur",
  "Hijrah Cinta", "Berkah Terindah", "Syukur Selalu", "Cahaya Langit",
];

const RELIGIOUS: ExtendedCategoryConfig = {
  names: RELIGIOUS_NAMES,
  subcats: [
    "Kajian", "Majelis Taklim", "Maulid", "Isra Mi'raj", "Ramadhan",
    "Peringatan Hari Besar", "Pengajian", "Santunan", "Halal Bihalal", "Tabligh Akbar",
  ],
  designs: [
    "Arabesque", "Modern Prayer", "Sacred Geometry", "Golden Dome", "Filigree Glow",
    "Nusantara Spiritual", "Minimalist Caligraphy", "Jannah Modern", "Mosque Serenity", "Bismillah Luxe",
  ],
  palettes: [
    "emerald-gold", "islamic-green", "gold-lux", "navy-royal", "teal-gold",
    "cream-gold", "white-gold", "midnight", "maroon-gold", "sage-gold",
  ],
  fonts: ["elegant", "luxury", "minimal", "hand", "playful"],
  illustrations: [
    "Masjid Dome", "Arabic Calligraphy", "Lantern Glow", "Islamic Geometry", "Prayer Motif",
    "Moon & Crescent", "Leaf of Faith", "Gold Arch", "Jannah Garden", "Majestic Minaret",
  ],
  badgeEvery: 12,
};

/* ---------------- TASYAKURAN ---------------- */
const TASYAKURAN_NAMES = [
  "Syukuran Rumah Baru", "Berkah Rumah Tangga", "Tasyakuran Keluarga", "Sukur Cita",
  "Rumah Impian", "Kunci Berkah", "Syukur Bahagia", "Wajah Baru Rumah",
  "Berkah Pertama", "Doa Rumah Baru", "Selamatan Kampung", "Syukuran Kelahiran",
  "Buah Hati Lahir", "Syukur Buah Cinta", "Tasyakuran Aqiqah", "Bahagia Bertambah",
  "Nikmat Sehat", "Syukur Rezeki", "Rezeki Lancar", "Syukuran Wisuda",
  "Berkah Lulus", "Syukuran Pernikahan", "Malam Berkat", "Buka Rumah",
  "Ngunduh Mantu", "Tingkeban", "Selapan Bayi", "Syukuran Hamil",
  "Mitoni", "Brokohan", "Syukuran Panen", "Berkah Panen",
  "Syukuran Usaha", "Toko Baru", "Grand Opening Berkah", "Syukuran Motor Baru",
  "Kendaraan Baru", "Mobil Baru", "Berkah Perjalanan", "Syukuran Sembuh",
  "Syukur Sehat", "Tasya Operasi", "Syukuran Kelulusan", "Angkatan Lulus",
  "Syukuran Haji", "Berangkat Haji", "Kepulangan Haji", "Syukuran Umroh",
  "Berkah Umroh", "Syukuran Jabatan", "Promosi Berkah", "Syukuran Nikah",
  "Resepsi Berkah", "Syukuran Ulang Tahun", "Panjang Umur", "Berkah Tahun Baru",
  "Syukur Menyambut", "Wajah Bahagia", "Rumah Mungil", "Syukur Rumah Dinas",
  "Berkah Istimewa", "Nikmat Terindah", "Bahagia Sederhana", "Syukur Sederhana",
  "Hati Yang Bersyukur", "Berbagi Kebahagiaan", "Kebersamaan Berkah", "Doa Keluarga",
  "Syukur Bersama", "Malam Syukuran", "Tasyakuran Sederhana", "Berkah Rumah",
  "Halaman Baru", "Pintu Berkah", "Cahaya Syukur", "Rasa Syukur",
  "Syukur Alhamdulillah", "Berkah Ilahi", "Karunia Nya", "Anugerah Terindah",
  "Kado Terindah", "Berkah Kecil", "Keluarga Bahagia Selalu", "Syukur Keluarga Kita",
  "Hangatnya Rumah", "Rumah Sejuk", "Syukur Damai", "Tentram Berkah",
  "Berkah Kelahiran", "Senyum Buah Hati", "Lahirnya Harapan", "Syukur Kehadiran",
  "Putra Pertama", "Putri Pertama", "Si Kecil Berkah", "Malaikat Kecil",
  "Berkah Awal", "Semoga Barokah", "Syukur Tak Terhingga", "Segala Puji Bagi Allah",
];

const TASYAKURAN: ExtendedCategoryConfig = {
  names: TASYAKURAN_NAMES,
  subcats: [
    "Rumah Baru", "Kelahiran", "Wisuda", "Pernikahan", "Panen",
    "Usaha Baru", "Kesehatan", "Haji & Umroh", "Keluarga", "Syukuran Sederhana",
  ],
  designs: [
    "Warm Home", "Minimal Family", "Elegant Welcome", "Sunrise Blessing", "Family Harmony",
    "Garden Feast", "Golden Blessing", "Modern Rumah", "Candlelight Joy", "Berkah Decor",
  ],
  palettes: [
    "emerald-green", "cream-gold", "brown-gold", "islamic-green", "sage",
    "gold-lux", "beige", "maroon-gold", "charcoal-gold", "ivory-gold",
  ],
  fonts: ["elegant", "hand", "minimal", "luxury", "playful"],
  illustrations: [
    "House Warmth", "Family Table", "Flower Garland", "Home Blessing", "Candle Glow",
    "Warm Sun", "Garden Decor", "Proud Family", "Berkah Lantern", "Joyful Entrance",
  ],
  badgeEvery: 10,
};

/* ---------------- GATHERING — Acara & Gathering ---------------- */
const GATHERING_NAMES = [
  "Family Gathering Ceria", "Reuni Akbar Kelas", "Arisan Ibu-Ibu", "Kopdar Komunitas",
  "Gathering Karyawan", "BBQ Keluarga Besar", "Picnic Weekend", "Reuni SMA Bahagia",
  "Reuni Kampus", "Temu Kangen", "Halal Bihalal Reuni", "Camping Bersama",
  "Api Unggun Malam", "Dinner Bersama", "Potluck Party", "House Warming Party",
  "Open House Keluarga", "Silaturahmi Akbar", "Arisan Bapak-Bapak", "Rapat Akbar Angkatan",
  "Family Day Kantor", "Gathering Komunitas Motor", "Kopdar Club", "Ngopi Bareng",
  "Bukber Komunitas", "Buka Puasa Bersama", "Tumpengan Warga", "Kerja Bakti Kampung",
  "Festival Kampung", "Lomba 17 Agustus", "HUT Kampung", "HUT Kota",
  "Acara Kantor", "Annual Dinner", "Gala Dinner", "Rooftop Party",
  "Beach Party", "Pool Party", "Garden Party", "Moonlit Picnic",
  "Sunrise Gathering", "Sunset Mingle", "City Tour Bersama", "Outbound Team",
  "Team Building", "Games Night", "Board Game Night", "Karaoke Bersama",
  "Musik Tanpa Batas", "Dance Night", "Jazz Malam", "Live Music Gathering",
  "Food Festival", "Kuliner Malam", "Foodtruck Fiesta", "Weekend Market",
  "Bazar Komunitas", "Charity Bazaar", "Bakti Sosial", "Donor Darah",
  "Volunteer Day", "Community Service", "Kelas Masak Bareng", "Workshop Kreatif",
  "Art Jam", "Pameran Komunitas", "Run Together", "Fun Walk",
  "Sport Day", "Badminton Bareng", "Futsal Malam", "Cycling Together",
  "Kopdar Kopi", "Komunitas Gitar", "Band Bareng", "Menghafal Bersama",
  "Ngaji Bareng", "Pengajian Komunitas", "Temu Komunitas", "Networking Malam",
  "Keluarga Besar", "Kumpul Keluarga", "Silaturahmi Keluarga", "Reuni Keluarga",
  "Arisan Keluarga", "Acara Keluarga", "Pesta Kebun", "Garden Barbecue",
  "Sore Ceria", "Weekend Vibes", "Happy Hour", "Malam Keakraban",
  "Makrab Kampus", "Rapat Pleno", "Musyawarah Warga", "Acara RT",
  "Gotong Royong", "Kearifan Kampung", "Festival Cahaya", "Perayaan Komunitas",
];

const GATHERING: ExtendedCategoryConfig = {
  names: GATHERING_NAMES,
  subcats: [
    "Family Gathering", "Reunion", "Community", "Corporate", "Casual Event",
    "Outdoor Event", "Dinner", "Celebration", "Arisan", "Bakti Sosial",
  ],
  designs: [
    "Party Hero", "Warm Welcome", "Gallery Night", "Modern Gather", "Community Table",
    "Open Air Joy", "Street Festival", "Sunset Gathering", "Lively Event", "Casual Charm",
  ],
  palettes: [
    "candy-pop", "ocean-teal", "yellow-sun", "orange-warm", "jungle-green",
    "rainbow", "candy-pastel", "pastel-mint", "space-navy", "purple-royal",
  ],
  fonts: ["playful", "elegant", "minimal", "hand", "neon"],
  illustrations: [
    "Party Lights", "Crowd Joy", "Happy Crowd", "Event Stage", "Community Table",
    "Lantern Glow", "Festival Decor", "Music Night", "Outdoor Vibes", "Gathering Moment",
  ],
  badgeEvery: 11,
};

/* ---------------- BUSINESS ---------------- */
const BUSINESS_NAMES = [
  "Grand Opening Megah", "Product Launching", "Launching Produk Baru", "Seminar Nasional",
  "Seminar Bisnis", "Workshop Skill", "Workshop Digital", "Talkshow Inspirasi",
  "Conference Tahunan", "Annual Summit", "Annual Meeting", "Rapat Kerja",
  "Rakernas", "Business Expo", "Startup Fair", "Tech Conference",
  "Innovation Day", "Demo Day", "Pitching Night", "Networking Night",
  "Gathering Eksekutif", "CEO Talk", "Leader Summit", "Executive Briefing",
  "Board Meeting", "Shareholders Meeting", "Brand Launch", "Rebranding Party",
  "Store Opening", "Cabang Baru", "Outlet Opening", "Franchise Fair",
  "Business Matching", "Trade Fair", "Industrial Exhibition", "Job Fair",
  "Career Expo", "Recruitment Day", "Onboarding Karyawan", "Anniversary Perusahaan",
  "Milestone Company", "Family Gathering Kantor", "Corporate Retreat", "Team Offsite",
  "Strategy Workshop", "Planning Session", "KPI Review", "Performance Review",
  "Sales Kickoff", "Sales Conference", "Marketing Summit", "Digital Marketing",
  "Sosmed Strategy", "Content Creator Fest", "Influencer Meetup", "Media Gathering",
  "Press Conference", "Launching Press", "Ribbon Cutting", "Groundbreaking",
  "Open House Office", "Client Appreciation", "Customer Gathering", "Partner Summit",
  "Distributor Meeting", "Dealer Conference", "Supplier Day", "Investor Day",
  "Funding Announcement", "IPO Celebration", "Award Ceremony", "Employee Award",
  "Night of Excellence", "Gala Corporate", "Annual Gala", "Board Dinner",
  "CEO Dinner", "Business Dinner", "Charity Gala", "CSR Program",
  "Donasi Korporat", "Ramah Tamah Bisnis", "Business Forum", "Economic Forum",
  "Fintech Summit", "Proptech Expo", "Retail Expo", "FnB Summit",
  "Hospitality Expo", "Edufair", "Kampus Career", "Magang Fair",
  "Inkubasi Startup", "Scale Up Day", "Growth Hack", "Sales Award",
  "Team Success", "One Team One Goal", "Vision 2030", "Momenkita Corporate",
];

const BUSINESS: ExtendedCategoryConfig = {
  names: BUSINESS_NAMES,
  subcats: [
    "Grand Opening", "Product Launching", "Seminar", "Workshop", "Conference",
    "Expo", "Networking", "Rapat Kerja", "Corporate", "Award Ceremony",
  ],
  designs: [
    "Corporate Hero", "Launch Statement", "Modern Stage", "Executive Board", "Professional Minimal",
    "Tech Seminar", "Business Showcase", "Luxury Opening", "Conference Glow", "Networking Connect",
  ],
  palettes: [
    "adult-charcoal", "navy", "royalblue", "black-gold", "monochrome",
    "modern", "geometric", "midnight", "emerald", "blue-white",
  ],
  fonts: ["minimal", "luxury", "playful", "elegant", "neon"],
  illustrations: [
    "Office Lights", "Boardroom Glow", "Conference Stage", "Product Wall", "Brand Story",
    "Event Stage", "Leadership Talks", "Business Skyline", "Launch Banner", "Corporate Frame",
  ],
  badgeEvery: 13,
};

/* ---------------- ANNIVERSARY ---------------- */
const ANNIVERSARY_NAMES = [
  "Setahun Cinta Kita", "Anniversary Pertama", "Ulang Tahun Pernikahan", "Dua Tahun Bersama",
  "Anniversary Ke 3", "Empat Tahun Cinta", "Anniversary Ke 5", "Lima Tahun Berdua",
  "Setengah Dekade", "Anniversary Ke 10", "Sepuluh Tahun Cinta", "Anniversary Ke 15",
  "Anniversary Ke 20", "Dua Dekade Cinta", "Anniversary Ke 25", "Silver Anniversary",
  "Anniversary Ke 30", "Anniversary Ke 40", "Golden Anniversary", "Emas Setengah Abad",
  "Cinta Tak Bertepi", "Satu Hati Selamanya", "Love Story Kita", "Kisah Kita",
  "Forever Us", "Selamanya Berdua", "Tentang Kita", "Dua Hati Satu Cinta",
  "Cinta Sejati", "Aku Dan Kamu", "Perjalanan Cinta", "Langkah Berdua",
  "Janji Sehidup", "Sumpah Setia", "Till Death Us Do Part", "Us Forever",
  "Our Journey", "The Beginning", "New Chapter", "Together Forever",
  "Belahan Jiwa", "Soulmate", "Pasangan Sejati", "Cinta Damai",
  "Sunset Love", "Morning Coffee Love", "Kecil Tapi Indah", "Bahagia Itu Sederhana",
  "Rumah Cinta", "Cinta Rumah Kita", "Sweet Home", "Hangatnya Rumah Kita",
  "Keluarga Bahagia Kami", "Bahagia Keluarga Kami", "Cerita Keluarga", "Anniversary Keluarga",
  "Ulang Tahun Hubungan", "One Year Together", "Two Hearts One Beat", "Milestone Cinta",
  "Perayaan Cinta", "Malam Romantis", "Candlelight Anniversary", "Dinner Malam Ini",
  "Getaway Berdua", "Bali Getaway", "Bandung Weekend", "Surprise Anniversary",
  "Kejutan Manis", "Hadiah Untukmu", "Bunga Untukmu", "Mawar Merah Cinta",
  "Langit Dan Laut", "Bintang Dan Bulan", "Sunrise Bersama", "Janji Setia",
  "Kepercayaan Kita", "Kejujuran Cinta", "Kesabaran Cinta", "Cinta Yang Dewasa",
  "Tumbuh Bersama", "Dewasa Bersama", "Saling Melengkapi", "Sempurna Tak Sempurna",
  "Cukup Bersamamu", "Terima Kasih Sayang", "Untukmu Selamanya", "Cinta Pertama Terakhir",
  "Last First Love", "Tetap Bersamamu", "Never Let Go", "Hold On Tight",
  "Second Honeymoon", "Honeymoon Lagi", "Berdua Saja", "Duo Bahagia",
  "Cinta Di Usia", "Cinta Seperti Kopi", "Sweetest Promise", "Sampai Tua Nanti",
];

const ANNIVERSARY: ExtendedCategoryConfig = {
  names: ANNIVERSARY_NAMES,
  subcats: [
    "Anniversary Ke-1", "Anniversary Ke-5", "Anniversary Ke-10", "Anniversary Ke-25", "Anniversary Ke-50",
    "Romantic Dinner", "Couple Getaway", "Renewal Vows", "Milestone Love", "Happy Ever After",
  ],
  designs: [
    "Romantic Hero", "Rose Glow", "Anniversary Story", "Golden Memory", "Chic Couple",
    "Luminous Lane", "Soft Bloom", "Modern Love", "Elegant Archive", "Forever Timeline",
  ],
  palettes: [
    "rosegold", "champagne", "ivory-gold", "crimson", "dustyrose",
    "blush", "black-gold", "purple-royal", "gold-lux", "navy",
  ],
  fonts: ["hand", "elegant", "luxury", "minimal", "playful"],
  illustrations: [
    "Heart Glow", "Rose Petals", "Couple Frame", "Memory Lane", "Golden Kiss",
    "Love Story", "Moonlight Promise", "Celebration Icons", "Blooming Hearts", "Forever Starlight",
  ],
  badgeEvery: 9,
};

/* ---------------- FAMILY ---------------- */
const FAMILY_NAMES = [
  "Kumpul Keluarga Besar", "Reuni Keluarga Sedulur", "Halal Bihalal Sedulur", "Family Day",
  "Arisan Keluarga Mingguan", "Open House Sedulur", "Silaturahmi Keluarga Kami", "Lebaran Keluarga",
  "Idul Fitri Bersama", "Natal Keluarga", "Tahun Baru Keluarga", "Ultah Nenek",
  "Ultah Kakek", "Ultah Ibu", "Ultah Ayah", "Ultah Adik",
  "Ultah Kakak", "Momen Ayah Ibu", "Hari Ayah", "Hari Ibu",
  "Liburan Keluarga", "Family Trip", "Weekend Keluarga", "Camping Keluarga",
  "BBQ Keluarga", "Makan Malam Keluarga", "Dinner Keluarga", "Sarapan Keluarga",
  "Berlibur Bersama", "Bermain Bersama", "Ngabuburit Keluarga", "Buka Bersama Keluarga",
  "Ngaji Keluarga", "Doa Keluarga Bersama", "Kebersamaan", "Kekompakan",
  "Kebahagiaan Keluarga", "Keluarga Sakinah", "Keluarga Harmonis", "Rumah Kedua",
  "Kampung Halaman", "Pulang Kampung", "Mudik Bersama", "Bahagia Mudik",
  "Kopdar Keluarga", "Keluarga Besar Ceria", "Silsilah Keluarga", "Family Tree",
  "Generasi Keluarga", "Tradisi Keluarga", "Warisan Cinta", "Kasih Sayang",
  "Cinta Keluarga", "Satu Keluarga", "Satu Banyak Cinta", "Keluarga Bahagia",
  "Rumahku Surgaku", "Cinta Tak Berujung", "Bersama Selamanya", "Sampai Kapanpun",
  "Kebersamaan Itu Indah", "Momen Berharga", "Kenangan Indah", "Album Keluarga",
  "Foto Keluarga", "Cerita Keluarga Kami", "Jejak Cerita", "Hari Bahagia",
  "Sukacita Keluarga", "Perayaan Keluarga", "Reuni Mingguan", "Weekend Bareng",
  "Senja Keluarga", "Pagi Ceria", "Anak Cucu", "Cucu Tersayang",
  "Kakek Nenek", "Orang Tua", "Doa Restu Ayah Ibu", "Berkah Orang Tua",
  "Restu Ibu", "Doa Ayah", "Syukur Keluarga", "Berkat Keluarga",
  "Harmoni Rumah", "Hangat Dan Damai", "Tentram Bersama", "Bersyukur Keluarga",
  "Rezeki Keluarga", "Hidup Sederhana", "Cukup Berkah", "Keluarga Kecil",
  "Keluarga Bahagia Sederhana", "Beranda Ceria", "Halaman Rumah", "Taman Keluarga",
  "Kebun Keluarga", "Masakan Ibu", "Kopi Bersama", "Cerita Santai",
];

const FAMILY: ExtendedCategoryConfig = {
  names: FAMILY_NAMES,
  subcats: [
    "Kumpul Keluarga", "Reuni Keluarga", "Halal Bihalal", "Family Day", "Arisan Keluarga",
    "Open House", "Lebaran", "Ultah Anggota", "Liburan Keluarga", "Kebersamaan",
  ],
  designs: [
    "Warm Hero", "Family Banner", "Heart Story", "Gathering Bloom", "Homecoming Joy",
    "Family Table", "Sunlit Home", "Togetherness", "Candid Family", "Legacy Memory",
  ],
  palettes: [
    "brown-cream", "beige", "sage", "terracotta", "dustyblue",
    "pastel-peach", "emerald-green", "yellow-sun", "cream-gold", "ocean-teal",
  ],
  fonts: ["cute", "hand", "elegant", "minimal", "playful"],
  illustrations: [
    "Family Love", "Warm Home", "Shared Smile", "Love Circle", "Together Frame",
    "Homecoming", "Family Table", "Hug Moment", "Joyful Bond", "Happy Yesterday",
  ],
  badgeEvery: 8,
};

/* ---------------- DOA & HAUL ---------------- */
const DOAHAUL_NAMES = [
  "Tahlilan Malam", "Tahlilan 7 Hari", "Tahlilan 40 Hari", "Tahlilan 100 Hari",
  "Peringatan Haul", "Haul Ke 1", "Haul Ke 3", "Haul Ke 7",
  "Haul Ke 25", "Haul Akbar", "Doa Bersama", "Yasinan Malam",
  "Istighotsah Doa", "Doa Untuk Almarhum", "Doa Untuk Almarhumah", "Mengirim Doa",
  "Fatihah Untuk Almarhum", "Al Fatihah", "Tahlil Dan Doa", "Doa Tahlil",
  "Doa Arwah", "Doa Mayit", "Ziarah Kubur", "Ziarah Makam",
  "Nyekar Bersama", "Ziarah Keluarga", "Ziarah Wali", "Doa Di Makam",
  "Malam Jumat", "Tahlil Jumat", "Yasin Fadilah", "Yasin Dan Tahlil",
  "Surat Yasin", "Doa Yasin", "Tawassul", "Shodaqoh Al Fatihah",
  "Berbagi Berkah", "Sedekah Doa", "Amal Jariyah", "Walimah Kematian",
  "Peringatan Wafat", "Wafatnya Ayah", "Wafatnya Ibu", "Wafatnya Kakek",
  "Wafatnya Nenek", "Wafatnya Keluarga", "Berpulangnya", "Kepulangan",
  "Kembali Ke Rahmatullah", "Innalillahi", "Semoga Khusnul Khotimah", "Khusnul Khotimah",
  "Rahimahullah", "Rahimahallahu", "Almarhum Bapak", "Almarhumah Ibu",
  "Almarhum Keluarga", "Doa Restu", "Doa Untuk Kebaikan", "Pengampunan",
  "Doa Pengampunan", "Ampunilah Dosa", "Cahaya Kubur", "Terang Kuburnya",
  "Doa Cahaya", "Nurul Kubur", "Berkah Alam Kubur", "Lapangkan Kuburnya",
  "Kelapangan Kubur", "Doa Kelembutan", "Doa Kedamaian", "Kedamaian Jiwa",
  "Doa Keikhlasan", "Ikhlas Berpisah", "Sabar Dan Ikhlas", "Ketabahan",
  "Kelapangan Hati", "Doa Ketabahan", "Ucapan Duka", "Turut Berduka",
  "Belasungkawa", "Duka Cita", "Doa Keluarga Duka", "Berita Duka",
  "Berita Duka Cita", "Kebaikan Almarhum", "Kenangan Baik", "Mengenang",
  "Mengenang Beliau", "Kisah Beliau", "Jejak Kebaikan", "Warisan Kebaikan",
  "Amal Beliau", "Teladan Beliau", "Cahaya Kenangan", "Doa Sang Anak",
  "Doa Cucu", "Doa Generasi", "Rahmat Selalu", "Doa Untuk Semua",
];

const DOAHAUL: ExtendedCategoryConfig = {
  names: DOAHAUL_NAMES,
  subcats: [
    "Tahlilan", "Haul", "Peringatan Wafat", "Doa Bersama", "Yasinan",
    "Ziarah Kubur", "Istighotsah", "Al Fatihah", "Duka Cita", "Mendoakan",
  ],
  designs: [
    "Serene Centered", "Calligraphy Focus", "Golden Frame", "Quiet Prayer", "Reflection Glow",
    "Ritual Calm", "Mourning Beauty", "Tender Memory", "Sacred Night", "Berkah Light",
  ],
  palettes: [
    "islamic-green", "emerald-gold", "midnight", "navy-royal", "sage",
    "black-gold", "brown-gold", "maroon-gold", "dustyblue", "cream-gold",
  ],
  fonts: ["hand", "elegant", "luxury", "minimal", "playful"],
  illustrations: [
    "Prayer Light", "Doa Verse", "Candle Glow", "Peaceful Night", "Milad Prayer",
    "Blessed Memory", "Sacred Calm", "Memory Lantern", "Night Reflection", "Faith Flourish",
  ],
  badgeEvery: 10,
};

export const EXTENDED_SEEDS: Record<"religious" | "tasyakuran" | "gathering" | "business" | "anniversary" | "family" | "doa-haul", ExtendedSeed[]> = {
  religious: buildSeeds(RELIGIOUS),
  tasyakuran: buildSeeds(TASYAKURAN),
  gathering: buildSeeds(GATHERING),
  business: buildSeeds(BUSINESS),
  anniversary: buildSeeds(ANNIVERSARY),
  family: buildSeeds(FAMILY),
  "doa-haul": buildSeeds(DOAHAUL),
};

export type ExtendedCategory = keyof typeof EXTENDED_SEEDS;
