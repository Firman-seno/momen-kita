import { Template, EventDetails } from '../types';

/* ============================================================
   INVITATION CONTENT — shared copy builder
   Used by the design-system sections and TemplateDemoView.
   ============================================================ */

export interface DemoContent {
  mainTitle: string;
  eventSubtitle: string;
  messageHeading: string;
  messageText: string;
  messageBy: string;
  countdownTitle: string;
  galleryHeading: string;
  galleryNote: string;
  mapHeading: string;
  rsvpHeading: string;
  rsvpNote: string;
  wishesHeading: string;
  wishesNote: string;
  wishesPlaceholder: string;
  wishButton: string;
  closingTitle: string;
  closingQuote: string;
  closingBy: string;
}

export const getDemoContent = (template: Template, eventDetails: EventDetails): DemoContent => {
  const cat = template.category;

  if (cat === 'sunatan') {
    return {
      mainTitle: eventDetails.childName || '',
      eventSubtitle: 'Khitanan Putra Kami',
      messageHeading: 'Doa & Ucapan',
      messageText: eventDetails.messageQuote || '',
      messageBy: eventDetails.parentsName || '',
      countdownTitle: 'Countdown Acara Khitanan',
      galleryHeading: 'Momen Sang Buah Hati',
      galleryNote: 'Kenangan kecil yang penuh makna',
      mapHeading: 'Lokasi Acara',
      rsvpHeading: 'Konfirmasi Kehadiran',
      rsvpNote: 'Mohon konfirmasi kehadiran Anda',
      wishesHeading: 'Kirim Doa & Ucapan',
      wishesNote: 'Tulis doa dan ucapan untuk si kecil',
      wishesPlaceholder: `Tulis doa & ucapan untuk ${eventDetails.childName}...`,
      wishButton: 'Kirim Doa & Ucapan',
      closingTitle: 'Jazakumullahu Khairan',
      closingQuote: '"Semoga Allah memberkahi dan menjadikannya anak yang sholeh."',
      closingBy: eventDetails.parentsName || '',
    };
  }

  if (cat === 'wedding') {
    return {
      mainTitle: `${eventDetails.groomName} & ${eventDetails.brideName}`,
      eventSubtitle: 'The Wedding of',
      messageHeading: 'Our Love Story',
      messageText: eventDetails.coupleStory || '',
      messageBy: eventDetails.hashtag || '#OurWedding',
      countdownTitle: 'Countdown Pernikahan',
      galleryHeading: 'Our Moments',
      galleryNote: 'Sepenggal cerita kami',
      mapHeading: 'Lokasi Acara',
      rsvpHeading: 'RSVP Kehadiran',
      rsvpNote: 'Mohon konfirmasi kehadiran Anda',
      wishesHeading: 'Kirim Ucapan',
      wishesNote: 'Tulis ucapan & doa untuk kedua mempelai',
      wishesPlaceholder: `Tulis ucapan untuk ${eventDetails.groomName} & ${eventDetails.brideName}...`,
      wishButton: 'Kirim Ucapan',
      closingTitle: 'Thank You',
      closingQuote: eventDetails.messageQuote || '',
      closingBy: `${eventDetails.groomName} & ${eventDetails.brideName}`,
    };
  }

  if (cat === 'aqiqah') {
    return {
      mainTitle: eventDetails.babyName || '',
      eventSubtitle: 'Syukuran Aqiqah',
      messageHeading: 'Doa Untuk Buah Hati',
      messageText: eventDetails.messageQuote || '',
      messageBy: eventDetails.parentsName || '',
      countdownTitle: 'Countdown Acara Aqiqah',
      galleryHeading: 'Little Moments',
      galleryNote: 'Kebahagiaan kecil yang besar artinya',
      mapHeading: 'Lokasi Acara',
      rsvpHeading: 'Konfirmasi Kehadiran',
      rsvpNote: 'Mohon konfirmasi kehadiran Anda',
      wishesHeading: 'Kirim Doa & Ucapan',
      wishesNote: 'Tulis doa & ucapan untuk sang buah hati',
      wishesPlaceholder: `Tulis doa & ucapan untuk ${eventDetails.babyName}...`,
      wishButton: 'Kirim Doa & Ucapan',
      closingTitle: 'Terima Kasih',
      closingQuote: eventDetails.messageQuote || '',
      closingBy: eventDetails.parentsName || '',
    };
  }

  if (cat === 'education') {
    return {
      mainTitle: eventDetails.graduateName || '',
      eventSubtitle: eventDetails.degreeName || 'Wisuda & Graduation',
      messageHeading: 'Ucapan & Doa',
      messageText: eventDetails.messageQuote || '',
      messageBy: eventDetails.parentsName || '',
      countdownTitle: 'Countdown Menuju Wisuda',
      galleryHeading: 'Momen Perjalanan',
      galleryNote: 'Perjalanan panjang menuju hari ini',
      mapHeading: 'Lokasi Acara',
      rsvpHeading: 'Konfirmasi Kehadiran',
      rsvpNote: 'Mohon konfirmasi kehadiran Anda',
      wishesHeading: 'Kirim Ucapan & Doa',
      wishesNote: 'Tulis ucapan untuk sang lulusan',
      wishesPlaceholder: `Tulis ucapan untuk ${eventDetails.graduateName}...`,
      wishButton: 'Kirim Ucapan',
      closingTitle: 'Terima Kasih',
      closingQuote: eventDetails.messageQuote || '',
      closingBy: eventDetails.parentsName || '',
    };
  }

  const extended = (['religious', 'tasyakuran', 'gathering', 'business', 'anniversary', 'family', 'doa-haul'] as const).includes(cat as never);

  if (extended) {
    const isDoa = cat === 'doa-haul';
    const isBusiness = cat === 'business';
    const isAnniversary = cat === 'anniversary';
    const mainTitle =
      isAnniversary && eventDetails.coupleName
        ? `${eventDetails.coupleName} • ${eventDetails.anniversaryYear ?? 1} Tahun`
        : eventDetails.eventTitle || template.name;
    const eventSubtitle =
      cat === 'anniversary'
        ? 'Anniversary Celebration'
        : cat === 'doa-haul'
          ? 'Undangan Doa & Haul'
          : cat === 'business'
            ? 'Undangan Bisnis & Acara'
            : cat === 'religious'
              ? 'Undangan Acara Keagamaan'
              : cat === 'tasyakuran'
                ? 'Undangan Tasyakuran'
                : cat === 'gathering'
                  ? 'Acara & Gathering'
                  : 'Undangan Keluarga';
    const by =
      isBusiness
        ? eventDetails.companyName || eventDetails.hostName || ''
        : eventDetails.hostName || '';
    const honoree =
      isDoa ? eventDetails.deceasedName || '' : by;
    return {
      mainTitle,
      eventSubtitle,
      messageHeading: cat === 'anniversary' ? 'Our Journey' : cat === 'doa-haul' ? 'Doa & Ucapan' : 'Undangan & Ucapan',
      messageText: eventDetails.messageQuote || '',
      messageBy: by,
      countdownTitle: isDoa ? 'Waktu Acara Tahlilan' : 'Countdown Menuju Acara',
      galleryHeading: cat === 'anniversary' ? 'Our Moments' : 'Momen Acara',
      galleryNote: cat === 'anniversary' ? 'Setiap tahun selalu ada cerita indah' : 'Dokumentasi keseruan acara kami',
      mapHeading: 'Lokasi Acara',
      rsvpHeading: 'Konfirmasi Kehadiran',
      rsvpNote: 'Mohon konfirmasi kehadiran Anda',
      wishesHeading: isDoa ? 'Kirim Doa & Ucapan' : 'Kirim Ucapan & Doa',
      wishesNote: isDoa
        ? `Tulis doa untuk ${honoree || 'almarhum/almarhumah'}`
        : `Tulis ucapan untuk ${eventDetails.eventTitle || 'acara ini'}`,
      wishesPlaceholder: isDoa
        ? `Tulis doa untuk ${honoree || 'almarhum/almarhumah'}...`
        : `Tulis ucapan untuk ${eventDetails.eventTitle || 'acara ini'}...`,
      wishButton: isDoa ? 'Kirim Doa' : 'Kirim Ucapan',
      closingTitle:
        cat === 'anniversary'
          ? 'Forever & Always'
          : cat === 'doa-haul'
            ? 'Al Fatihah'
            : cat === 'business'
              ? 'Terima Kasih'
              : 'Terima Kasih',
      closingQuote: eventDetails.messageQuote || '',
      closingBy:
        isBusiness
          ? eventDetails.companyName || eventDetails.hostName || ''
          : isAnniversary
            ? eventDetails.coupleName || eventDetails.hostName || ''
            : eventDetails.hostName || '',
    };
  }

  // birthday (default)
  return {
    mainTitle: `${eventDetails.birthdayPerson}'s ${eventDetails.age}th`,
    eventSubtitle: 'Birthday Invitation',
    messageHeading: 'Birthday Message',
    messageText: eventDetails.messageQuote || '',
    messageBy: `${eventDetails.birthdayPerson} & Family`,
    countdownTitle: 'Countdown to the Party',
    galleryHeading: 'Photo Gallery',
    galleryNote: 'Kenangan indah yang tak terlupakan',
    mapHeading: 'Event Location Map',
    rsvpHeading: 'Will You Attend?',
    rsvpNote: 'Please confirm your presence',
    wishesHeading: 'Leave a Birthday Wish',
    wishesNote: `Tulis ucapan & doa hangat untuk ${eventDetails.birthdayPerson}`,
    wishesPlaceholder: `Tulis ucapan ulang tahun untuk ${eventDetails.birthdayPerson}...`,
    wishButton: 'Send Wish / Kirim Ucapan',
    closingTitle: 'See You At The Party!',
    closingQuote: '"Kehadiran dan doa Anda adalah kado terindah bagi kami."',
    closingBy: `${eventDetails.birthdayPerson} & Family`,
  };
};
