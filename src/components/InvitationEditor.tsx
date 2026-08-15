import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { EventDetails, Template } from '../types';
import { getTemplateByUid } from '../data/templates';
import { MUSIC_LIBRARY, TrackGenre, TRACK_GENRES, getCategoryRecommendation, getTrackByUrl } from '../data/musicLibrary';
import { CATEGORY_BASE } from '../data/categoryBase';
import {
  Invitation,
  InvitationMusic,
  createInvitation,
  getInvitationById,
  updateInvitation,
  getInvitationTitle,
} from '../lib/invitations';
import { getOrderById, updateOrder } from '../lib/orders';
import { previewTrack, stopPreview } from '../lib/audioEngine';
import { fileToOptimizedDataUrl, fileToDataUrl } from '../lib/imageUtils';
import { uploadImageToPublic } from '../lib/imageStorage';
import {
  GalleryItem,
  MAX_GALLERY,
  DEFAULT_GALLERY,
  genGalleryId,
  toGalleryItems,
  toGalleryImages,
} from '../lib/gallery';
import {
  validateVideoFile,
  isValidPublicVideoUrl,
  uploadVideoToPublic,
  deletePublicVideo,
} from '../lib/videoStorage';
import { UiButton } from './UiButton';
import { Toast } from './Toast';
import { SharePanel } from './SharePanel';
import { TemplateDemoView } from './TemplateDemoView';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from './AnimationKit';

interface InvitationEditorProps {
  templateUid?: string;
  invitationId?: string;
  /** When creating from an Order → auto-fills customer + links the order. */
  orderId?: string;
  onBack: () => void;
  onOpenInvitation?: (slug: string) => void;
}

/** One slot in the dynamic FOTO GALERI list (unique id per gallery item). */
interface FormData {
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  address: string;
  googleMapsUrl: string;
  messageQuote: string;
  portraitImage: string;
  galleryItems: GalleryItem[];
  videoUrl: string;
  videoType: string;
  videoName: string;
  birthdayPerson: string;
  age: string;
  childName: string;
  parentsName: string;
  babyName: string;
  babyGender: string;
  babyBirthDate: string;
  groomName: string;
  brideName: string;
  groomParents: string;
  brideParents: string;
  akadDate: string;
  resepsiDate: string;
  coupleStory: string;
  hashtag: string;
  eventTitle: string;
  graduateName: string;
  degreeName: string;
  institutionName: string;
}

const START_TIME_OPTIONS = [0, 15, 30, 45, 60];

const formatStartTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/** Max image size for gallery uploads (photos downscale to ~1280px JPEG anyway). */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const emptyForm = (): FormData => ({
  customerName: '',
  customerPhone: '',
  eventDate: '',
  eventTime: '',
  venue: '',
  address: '',
  googleMapsUrl: '',
  messageQuote: '',
  portraitImage: '',
  galleryItems: toGalleryItems([]),
  videoUrl: '',
  videoType: '',
  videoName: '',
  birthdayPerson: '',
  age: '',
  childName: '',
  parentsName: '',
  babyName: '',
  babyGender: '',
  babyBirthDate: '',
  groomName: '',
  brideName: '',
  groomParents: '',
  brideParents: '',
  akadDate: '',
  resepsiDate: '',
  coupleStory: '',
  hashtag: '',
  eventTitle: '',
  graduateName: '',
  degreeName: '',
  institutionName: '',
});

/** Initialize form from a template's sample data (nice defaults). */
const formFromTemplate = (template: Template): FormData => {
  const f = emptyForm();
  const d = template.eventDetails;
  f.eventDate = d.date || '';
  f.eventTime = d.time || '';
  f.venue = d.venue || '';
  f.address = d.address || '';
  f.googleMapsUrl = d.googleMapsUrl || '';
  f.messageQuote = d.messageQuote || '';
  f.portraitImage = d.portraitImage || '';
  f.galleryItems = toGalleryItems(d.galleryImages);
  if (template.category === 'birthday') {
    f.birthdayPerson = d.birthdayPerson || '';
    f.age = d.age != null ? String(d.age) : '';
  }
  if (template.category === 'sunatan') {
    f.childName = d.childName || '';
    f.parentsName = d.parentsName || '';
  }
  if (template.category === 'aqiqah') {
    f.babyName = d.babyName || '';
    f.babyGender = d.babyGender || '';
    f.babyBirthDate = d.babyBirthDate || '';
    f.parentsName = d.parentsName || '';
  }
  if (template.category === 'wedding') {
    f.groomName = d.groomName || '';
    f.brideName = d.brideName || '';
    f.groomParents = d.groomParents || '';
    f.brideParents = d.brideParents || '';
    f.akadDate = d.akadDate || '';
    f.resepsiDate = d.resepsiDate || '';
    f.coupleStory = d.coupleStory || '';
    f.hashtag = d.hashtag || '';
  }
  if (template.category === 'education') {
    f.eventTitle = d.eventTitle || '';
    f.graduateName = d.graduateName || '';
    f.degreeName = d.degreeName || '';
    f.institutionName = d.institutionName || '';
  }
  return f;
};

/** Form from an existing invitation. */
const formFromInvitation = (inv: Invitation): FormData => {
  const baseTemplate = getTemplateByUid(inv.templateUid);
  const f = baseTemplate ? formFromTemplate(baseTemplate) : emptyForm();
  const d = inv.customData as Partial<EventDetails>;
  f.customerName = inv.customerName || '';
  f.customerPhone = inv.customerPhone || '';
  f.eventDate = inv.eventDate || d.date || '';
  f.eventTime = inv.eventTime || d.time || '';
  f.venue = inv.venue || d.venue || '';
  f.address = inv.address || d.address || '';
  f.googleMapsUrl = inv.googleMapsUrl || d.googleMapsUrl || '';
  f.messageQuote = d.messageQuote || '';
  f.portraitImage = d.portraitImage || '';
  f.galleryItems = toGalleryItems(d.galleryImages);
  f.videoUrl = inv.videoUrl || '';
  f.videoType = inv.videoType || '';
  f.videoName = inv.videoName || '';
  if (inv.category === 'birthday') {
    f.birthdayPerson = d.birthdayPerson || '';
    f.age = d.age != null ? String(d.age) : '';
  }
  if (inv.category === 'sunatan') {
    f.childName = d.childName || '';
    f.parentsName = d.parentsName || '';
  }
  if (inv.category === 'aqiqah') {
    f.babyName = d.babyName || '';
    f.babyGender = d.babyGender || '';
    f.babyBirthDate = d.babyBirthDate || '';
    f.parentsName = d.parentsName || '';
  }
  if (inv.category === 'wedding') {
    f.groomName = d.groomName || '';
    f.brideName = d.brideName || '';
    f.groomParents = d.groomParents || '';
    f.brideParents = d.brideParents || '';
    f.akadDate = d.akadDate || '';
    f.resepsiDate = d.resepsiDate || '';
    f.coupleStory = d.coupleStory || '';
    f.hashtag = d.hashtag || '';
  }
  if (inv.category === 'education') {
    f.eventTitle = d.eventTitle || '';
    f.graduateName = d.graduateName || '';
    f.degreeName = d.degreeName || '';
    f.institutionName = d.institutionName || '';
  }
  return f;
};

/** Build the EventDetails override (customData) from the form. */
const buildCustomData = (category: string, f: FormData): Partial<EventDetails> => {
  const galleryImages = toGalleryImages(f.galleryItems);
  const data: Partial<EventDetails> = {
    messageQuote: f.messageQuote,
    portraitImage: f.portraitImage || undefined,
    galleryImages: galleryImages.length ? galleryImages : undefined,
    googleMapsUrl: f.googleMapsUrl || undefined,
  };
  if (category === 'birthday') {
    data.birthdayPerson = f.birthdayPerson;
    if (f.age) data.age = parseInt(f.age, 10) || undefined;
  }
  if (category === 'sunatan') {
    data.childName = f.childName;
    data.parentsName = f.parentsName;
  }
  if (category === 'aqiqah') {
    data.babyName = f.babyName;
    data.babyGender = f.babyGender;
    data.babyBirthDate = f.babyBirthDate;
    data.parentsName = f.parentsName;
  }
  if (category === 'wedding') {
    data.groomName = f.groomName;
    data.brideName = f.brideName;
    data.groomParents = f.groomParents;
    data.brideParents = f.brideParents;
    data.akadDate = f.akadDate;
    data.resepsiDate = f.resepsiDate;
    data.coupleStory = f.coupleStory;
    data.hashtag = f.hashtag;
  }
  if (category === 'education') {
    data.eventTitle = f.eventTitle;
    data.graduateName = f.graduateName;
    data.degreeName = f.degreeName;
    data.institutionName = f.institutionName;
    data.parentsName = f.parentsName;
  }
  return data;
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  hint?: string;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  textarea = false,
  hint,
  required = false,
}) => {
  const cls =
    'w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-3 font-body text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline/70 transition-colors box-border';
  return (
    <label className="block">
      <span className="block font-body text-[11px] sm:text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${cls} resize-none`}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
          required={required}
        />
      )}
      {hint && <span className="block font-body text-[10px] sm:text-[11px] text-outline mt-1">{hint}</span>}
    </label>
  );
};

interface PhotoFieldProps {
  label: string;
  value: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  hint?: string;
  uploading?: boolean;
}

const PhotoField: React.FC<PhotoFieldProps> = ({ label, value, onUpload, onRemove, hint, uploading }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    onUpload(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="block font-body text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-start gap-3">
        <div className="w-20 h-28 rounded-xl border border-outline-variant/50 bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-2xl text-outline">image</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-micro w-full min-h-[36px] px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">{uploading ? 'hourglass_top' : value ? 'photo_camera' : 'upload'}</span>
            {uploading ? 'Memproses...' : value ? 'Ganti Foto' : 'Upload Foto'}
          </button>
          {value && (
            <button
              onClick={onRemove}
              className="btn-micro w-full min-h-[36px] px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Remove Foto
            </button>
          )}
          <span className="font-body text-[10px] text-outline leading-snug">{hint}</span>
        </div>
      </div>
    </div>
  );
};

interface GalleryFieldProps {
  id: string;
  label: string;
  value: string;
  /** First 4 slots are default/protected — REMOVE GALERI is hidden for them. */
  removable: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemoveFoto: () => void;
  onRemoveGaleri: () => void;
}

/** One dynamic FOTO GALERI card: preview + GANTI FOTO + REMOVE FOTO + REMOVE GALERI. */
const GalleryField: React.FC<GalleryFieldProps> = ({
  id,
  label,
  value,
  removable,
  uploading,
  onUpload,
  onRemoveFoto,
  onRemoveGaleri,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    onUpload(file);
  };

  return (
    <div
      id={`gallery-card-${id}`}
      className="flex flex-col gap-2.5 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-3"
    >
      <span className="block font-body text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-start gap-3">
        <div className="w-24 h-32 rounded-xl border border-outline-variant/50 bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-2xl text-outline">image</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-micro w-full min-h-[36px] px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">{uploading ? 'hourglass_top' : value ? 'photo_camera' : 'upload'}</span>
            {uploading ? 'Memproses...' : value ? 'Ganti Foto' : 'Upload Foto'}
          </button>
          <button
            onClick={onRemoveFoto}
            disabled={!value || uploading}
            className="btn-micro w-full min-h-[36px] px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Remove Foto
          </button>
          {removable && (
            <button
              onClick={onRemoveGaleri}
              disabled={uploading}
              className="btn-micro w-full min-h-[36px] px-3 rounded-lg border border-rose-300 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Remove Galeri
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const InvitationEditor: React.FC<InvitationEditorProps> = ({
  templateUid,
  invitationId,
  orderId,
  onBack,
  onOpenInvitation,
}) => {
  const template: Template | undefined = useMemo(
    () => (templateUid ? getTemplateByUid(templateUid) : invitationId ? getTemplateByUid(getInvitationById(invitationId)?.templateUid || '') : undefined),
    [templateUid, invitationId]
  );

  const existingInvitation: Invitation | undefined = useMemo(
    () => (invitationId ? getInvitationById(invitationId) : undefined),
    [invitationId]
  );

  const linkedOrder = useMemo(
    () => (orderId ? getOrderById(orderId) : undefined),
    [orderId]
  );

  const [form, setForm] = useState<FormData>(() =>
    existingInvitation
      ? formFromInvitation(existingInvitation)
      : template
        ? formFromTemplate(template)
        : emptyForm()
  );

  // Pre-fill customer data from the linked Order (Order → Invitation flow)
  useEffect(() => {
    if (!linkedOrder || existingInvitation) return;
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || linkedOrder.customerName || '',
      customerPhone: prev.customerPhone || linkedOrder.customerPhone || '',
    }));
  }, [linkedOrder, existingInvitation]);

  const [status, setStatus] = useState<'draft' | 'published'>(
    existingInvitation?.status === 'published' ? 'published' : 'draft'
  );
  const [savedInvitation, setSavedInvitation] = useState<Invitation | null>(existingInvitation || null);
  const [toast, setToast] = useState('');
  const [toastIcon, setToastIcon] = useState('check_circle');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormData>(form);
  const [saving, setSaving] = useState(false);

  // Music selection (admin-only)
  const defaultMusic: InvitationMusic | null = template
    ? {
        id: getTrackByUrl(template.music.musicUrl)?.uid ?? template.music.templateNumber,
        title: template.music.musicTitle,
        url: template.music.musicUrl,
        startTime: template.music.startTime || 0,
      }
    : null;
  const [musicEnabled, setMusicEnabled] = useState<boolean>(existingInvitation?.musicEnabled !== false);
  const [music, setMusic] = useState<InvitationMusic | null>(
    existingInvitation?.music !== undefined ? existingInvitation.music : defaultMusic
  );
  // Admin-chosen start offset — skips the track's intro/ambience and lands
  // straight on the vocal section.
  const [musicStartTime, setMusicStartTime] = useState<number>(
    existingInvitation?.music?.startTime ?? template?.music?.startTime ?? 0
  );
  const [previewingTrack, setPreviewingTrack] = useState<string | null>(null);
  const previewTimerRef = useRef<number | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [musicGenreFilter, setMusicGenreFilter] = useState<'All' | TrackGenre>('All');
  const [musicVocalFilter, setMusicVocalFilter] = useState<'all' | 'vocal' | 'instrumental'>('all');
  // Custom (admin-uploaded) music file — kept separate from library picks so
  // the UI can offer a "remove / switch back to library" path.
  const [customMusic, setCustomMusic] = useState<{ id: string; name: string; url: string } | null>(
    existingInvitation?.music?.url?.startsWith('data:')
      ? { id: existingInvitation.music.id, name: existingInvitation.music.title, url: existingInvitation.music.url }
      : null
  );

  // Stop music preview when closing/leaving editor
  useEffect(() => () => {
    stopPreview();
    if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
  }, []);

  const set = (key: keyof FormData) => (v: string) => setForm((prev) => ({ ...prev, [key]: v }));

  const handleMusicPreview = (track: { uid: string; url: string }) => {
    if (previewingTrack === track.uid) {
      stopPreview();
      if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
      setPreviewingTrack(null);
      return;
    }
    stopPreview();
    previewTrack([track.url], 0.35, 15000, musicStartTime * 1000);
    if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
    previewTimerRef.current = window.setTimeout(() => setPreviewingTrack(null), 16000);
    setPreviewingTrack(track.uid);
  };

  const handlePhotoUpload = async (field: keyof FormData, file: File | null) => {
    if (!file) return;
    setUploadingField(field);
    try {
      const dataUrl = await fileToOptimizedDataUrl(file);
      const folder = savedInvitation?.slug
        ? `invitations/${savedInvitation.slug}`
        : undefined;
      const publicUrl = await uploadImageToPublic(dataUrl, folder);
      if (publicUrl) {
        set(field)(publicUrl);
      } else {
        set(field)(dataUrl);
        setToast('Penyimpanan cloud belum aktif — foto disimpan lokal (pratinjau WhatsApp mungkin tidak menampilkan foto).');
        setToastIcon('info');
      }
    } catch {
      setToast('Gagal memproses foto.');
      setToastIcon('error');
    } finally {
      setUploadingField(null);
    }
  };

  // ---- Dynamic FOTO GALERI -----------------------------------------

  const updateGalleryItem = (id: string, url: string) =>
    setForm((prev) => ({
      ...prev,
      galleryItems: prev.galleryItems.map((it) => (it.id === id ? { ...it, url } : it)),
    }));

  /** REMOVE GALERI — deletes the whole gallery slot (only allowed for extra items). */
  const removeGalleryItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      galleryItems: prev.galleryItems.filter((it) => it.id !== id),
    }));
    setToast('Galeri dihapus.');
    setToastIcon('info');
  };

  /** REMOVE FOTO — clears the image but keeps the gallery slot. */
  const removeGalleryPhoto = (id: string) => {
    updateGalleryItem(id, '');
    setToast('Foto galeri dihapus.');
    setToastIcon('info');
  };

  /** Per-item upload — only ever writes to the gallery with `itemId`. */
  const handleGalleryUpload = async (itemId: string, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast('Berkas harus berupa gambar (JPG/PNG/WebP).');
      setToastIcon('error');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setToast('Ukuran foto maksimal 10 MB.');
      setToastIcon('error');
      return;
    }
    setUploadingField(`gallery-${itemId}`);
    try {
      const dataUrl = await fileToOptimizedDataUrl(file);
      const folder = savedInvitation?.slug
        ? `invitations/${savedInvitation.slug}`
        : undefined;
      const publicUrl = await uploadImageToPublic(dataUrl, folder);
      if (publicUrl) {
        updateGalleryItem(itemId, publicUrl);
      } else {
        updateGalleryItem(itemId, dataUrl);
        setToast('Penyimpanan cloud belum aktif — foto disimpan lokal (pratinjau WhatsApp mungkin tidak menampilkan foto).');
        setToastIcon('info');
      }
    } catch {
      setToast('Gagal memproses foto.');
      setToastIcon('error');
    } finally {
      setUploadingField(null);
    }
  };

  /** "+ ADD GALERI" — appends one new empty slot (no page reload), then scrolls to it. */
  const handleAddGaleri = () => {
    if (form.galleryItems.length >= MAX_GALLERY) return;
    const id = genGalleryId();
    setForm((prev) =>
      prev.galleryItems.length >= MAX_GALLERY
        ? prev
        : { ...prev, galleryItems: [...prev.galleryItems, { id, url: '' }] }
    );
    window.setTimeout(() => {
      document.getElementById(`gallery-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  const handleVideoUpload = async (file: File | null) => {
    if (!file || uploadingVideo) return;
    const validationError = validateVideoFile(file);
    if (validationError) {
      setToast(validationError);
      setToastIcon('error');
      return;
    }
    const previousUrl = form.videoUrl;
    setUploadingVideo(true);
    setVideoProgress(0);
    try {
      const folder = savedInvitation?.slug
        ? `invitations/${savedInvitation.slug}`
        : 'invitations';
      const publicUrl = await uploadVideoToPublic(file, folder, (p) => setVideoProgress(Math.round(p)));
      if (!publicUrl) {
        throw new Error('Upload gagal');
      }
      const name = file.name || undefined;
      const type = file.type || undefined;
      // Only commit when the new upload succeeded — a failed replace keeps the old video.
      setForm((prev) => ({ ...prev, videoUrl: publicUrl, videoType: type, videoName: name }));
      if (previousUrl && previousUrl !== publicUrl) {
        void deletePublicVideo(previousUrl);
      }
      setToast('Video berhasil diupload dan tersimpan.');
      setToastIcon('success');
    } catch {
      setToast('Video gagal diupload. Silakan coba lagi.');
      setToastIcon('error');
    } finally {
      setUploadingVideo(false);
      setVideoProgress(null);
    }
  };

  const handleRemoveVideo = () => {
    const oldUrl = form.videoUrl;
    setForm((prev) => ({ ...prev, videoUrl: '', videoType: '', videoName: '' }));
    if (oldUrl) void deletePublicVideo(oldUrl);
    setToast('Video dihapus dari undangan.');
    setToastIcon('info');
  };

  const handleMusicUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingField('customMusic');
    try {
      if (!file.type.startsWith('audio/')) {
        throw new Error('Berkas harus berupa file audio (MP3).');
      }
      if (file.size > 4 * 1024 * 1024) {
        throw new Error('Ukuran file musik maksimal 4MB.');
      }
      const dataUrl = await fileToDataUrl(file);
      const id = `custom-${Date.now()}`;
      const name = file.name.replace(/\.[^.]+$/, '');
      setCustomMusic({ id, name, url: dataUrl });
      setMusic({ id, title: name, url: dataUrl });
      setToast(`Musik "${name}" berhasil ditambahkan.`);
      setToastIcon('check_circle');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Gagal membaca file musik.');
      setToastIcon('error');
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveCustomMusic = () => {
    setCustomMusic(null);
    setMusic(defaultMusic);
    setToast('Kembali ke musik default template.');
    setToastIcon('check_circle');
  };

  if (!template) {
    return (
      <div className="flex-grow w-full min-h-[60vh] flex flex-col items-center justify-center px-4 pt-28">
        <h2 className="font-headline text-xl font-bold text-on-surface mb-2">Template tidak ditemukan</h2>
        <UiButton variant="primary" onClick={onBack}>
          Kembali
        </UiButton>
      </div>
    );
  }

  const cat = template.category;
  const categoryLabel = template.categoryLabel;

  const filteredTracks = useMemo(() => {
    let list = MUSIC_LIBRARY[CATEGORY_BASE[cat]];
    if (musicGenreFilter !== 'All') list = list.filter((t) => t.genre === musicGenreFilter);
    if (musicVocalFilter === 'vocal') list = list.filter((t) => t.isVocal);
    if (musicVocalFilter === 'instrumental') list = list.filter((t) => !t.isVocal);
    return list;
  }, [cat, musicGenreFilter, musicVocalFilter]);

  /** Block saving when core data is incomplete or the WA number is invalid. */
  const validateForm = (): string | null => {
    if (!form.customerName.trim()) return 'Nama pemesan wajib diisi.';
    if (!form.customerPhone.trim()) return 'Nomor WhatsApp pemilik wajib diisi agar tamu dapat menghubungi pemilik.';
    const digits = form.customerPhone.replace(/[^\d]/g, '');
    if (digits.length < 9 || digits.length > 15) return 'Nomor WhatsApp tidak valid. Periksa kembali.';
    if (!form.eventDate.trim()) return 'Tanggal acara wajib diisi.';
    if (cat === 'wedding' && (!form.groomName.trim() || !form.brideName.trim())) return 'Nama mempelai pria dan wanita wajib diisi.';
    if (cat === 'sunatan' && !form.childName.trim()) return 'Nama anak wajib diisi.';
    if (cat === 'aqiqah' && !form.babyName.trim()) return 'Nama bayi wajib diisi.';
    if (cat === 'birthday' && !form.birthdayPerson.trim()) return 'Nama yang berulang tahun wajib diisi.';
    if (cat === 'education' && !form.graduateName.trim()) return 'Nama lulusan wajib diisi.';
    if (form.videoUrl && !isValidPublicVideoUrl(form.videoUrl)) {
      return 'Video gagal diupload. Silakan coba lagi.';
    }
    return null;
  };

  const handleSave = (publish: boolean) => {
    setSaving(true);

    // Validation — never save an invitation with missing core data
    const validationError = validateForm();
    if (validationError) {
      setSaving(false);
      setToast(validationError);
      setToastIcon('error');
      return;
    }

    const customData = buildCustomData(cat, form);
    const payload: Partial<Invitation> = {
      templateUid: template.uid,
      category: cat,
      templateNumber: template.templateNumber,
      templateImage: template.image,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      venue: form.venue,
      address: form.address,
      googleMapsUrl: form.googleMapsUrl || undefined,
      orderId: linkedOrder?.id || savedInvitation?.orderId || undefined,
      music: musicEnabled && music ? { ...music, startTime: musicStartTime } : null,
      musicEnabled,
      videoUrl: form.videoUrl || undefined,
      videoType: form.videoType || undefined,
      videoName: form.videoName || undefined,
      customData,
      status: publish ? 'published' : 'draft',
    };

    let result: Invitation | undefined;
    if (savedInvitation) {
      result = updateInvitation(savedInvitation.id, payload);
    } else {
      result = createInvitation(payload);
    }

    // Keep the Order → Invitation relation in sync (invitationId + public slug)
    if (result) {
      const orderTarget = linkedOrder?.id || savedInvitation?.orderId;
      if (orderTarget) {
        const order = getOrderById(orderTarget);
        if (order && (order.invitationId !== result.id || order.invitationSlug !== result.slug)) {
          updateOrder(orderTarget, { invitationId: result.id, invitationSlug: result.slug });
        }
      }
    }

    // Simulate a tiny save delay for a satisfying UX then update state
    window.setTimeout(() => {
      setSaving(false);
      if (result) {
        setSavedInvitation(result);
        setStatus(publish ? 'published' : 'draft');
        setToast(
          publish ? 'Undangan berhasil diterbitkan.' : 'Undangan berhasil disimpan.'
        );
        setToastIcon('check_circle');
      } else {
        setToast('Gagal menyimpan undangan.');
        setToastIcon('error');
      }
    }, 350);
  };

  const handlePreview = () => {
    setPreviewForm(form);
    setPreviewOpen(true);
  };

  const invitationTitle = savedInvitation
    ? getInvitationTitle(savedInvitation, template)
    : (form.customerName ? `Undangan ${form.customerName}` : `Undangan ${categoryLabel}`);

  const requiredName = cat === 'wedding' ? 'Nama Mempelai' : cat === 'sunatan' ? 'Nama Anak' : cat === 'aqiqah' ? 'Nama Bayi' : cat === 'education' ? 'Nama Lulusan' : 'Nama Yang Berulang Tahun';

  return (
    <div className="flex-grow w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 pt-24 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <button
            onClick={onBack}
            className="font-body text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Kembali
          </button>
          <h1 className="font-headline text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
            {invitationId ? 'Edit Undangan' : 'Buat Undangan'} — {categoryLabel} #{template.templateNumber}
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
            {template.name} • Isi data customer, lalu simpan & bagikan link unik.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${
            status === 'published'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-amber-50 text-amber-700 border-amber-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
          {status === 'published' ? 'Published' : 'Draft'}
        </div>
      </div>

      {/* Template preview strip */}
      <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-3 mb-6">
        <img
          src={template.image}
          alt={template.name}
          className="w-12 h-16 sm:w-14 sm:h-[72px] object-cover rounded-lg border border-outline-variant/40 shrink-0"
        />
        <div className="min-w-0">
          <span className="text-[10px] font-body font-bold text-primary uppercase tracking-wider">
            {template.id} • {categoryLabel}
          </span>
          <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface truncate">{template.name}</h3>
          <p className="font-body text-[11px] sm:text-xs text-on-surface-variant truncate">
            {template.subcategory} • {template.designStyle}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="font-headline text-base sm:text-lg font-bold text-primary mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-secondary">edit_note</span>
          Data Undangan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Section: Customer / Pemilik */}
          <div className="md:col-span-2">
            <h3 className="font-body text-[11px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/40 pb-2 mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">person</span> Data Pemesan / Pemilik Acara
            </h3>
          </div>
          <Field label="Nama Pemesan" value={form.customerName} onChange={set('customerName')} placeholder="e.g. Ibu Siti Aminah" />
          <Field label="Nomor WhatsApp Pemilik" value={form.customerPhone} onChange={set('customerPhone')} placeholder="e.g. 6281234567890" hint="Tamu bisa menghubungi nomor ini dari undangan." />

          {/* Section: Event */}
          <div className="md:col-span-2">
            <h3 className="font-body text-[11px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/40 pb-2 mb-4 mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">event</span> Detail Acara
            </h3>
          </div>

          {cat === 'birthday' && (
            <>
              <Field label="Nama Yang Berulang Tahun" value={form.birthdayPerson} onChange={set('birthdayPerson')} placeholder="e.g. Sarah" required />
              <Field label="Usia" value={form.age} onChange={set('age')} placeholder="e.g. 17" type="number" />
            </>
          )}
          {cat === 'sunatan' && (
            <>
              <Field label="Nama Anak" value={form.childName} onChange={set('childName')} placeholder="e.g. Muhammad Rafi" required />
              <Field label="Nama Orang Tua" value={form.parentsName} onChange={set('parentsName')} placeholder="e.g. Bpk. Rudi & Ibu Siti" />
            </>
          )}
          {cat === 'aqiqah' && (
            <>
              <Field label="Nama Bayi" value={form.babyName} onChange={set('babyName')} placeholder="e.g. Bilal" required />
              <Field label="Jenis Kelamin" value={form.babyGender} onChange={set('babyGender')} placeholder="e.g. Laki-laki / Perempuan" />
              <Field label="Tanggal Lahir" value={form.babyBirthDate} onChange={set('babyBirthDate')} placeholder="e.g. 13 Juni 2026" />
              <Field label="Nama Orang Tua" value={form.parentsName} onChange={set('parentsName')} placeholder="e.g. Bpk. Andi & Ibu Nur" />
            </>
          )}
          {cat === 'wedding' && (
            <>
              <Field label="Nama Mempelai Pria" value={form.groomName} onChange={set('groomName')} placeholder="e.g. Aditya Pratama" required />
              <Field label="Nama Mempelai Wanita" value={form.brideName} onChange={set('brideName')} placeholder="e.g. Nadia Ayu" required />
              <Field label="Nama Ayah & Ibu Pria" value={form.groomParents} onChange={set('groomParents')} placeholder="e.g. Bpk. Bambang & Ibu Sri" />
              <Field label="Nama Ayah & Ibu Wanita" value={form.brideParents} onChange={set('brideParents')} placeholder="e.g. Bpk. Suparman & Ibu Ratih" />
              <Field label="Tanggal Akad Nikah" value={form.akadDate} onChange={set('akadDate')} placeholder="e.g. Sabtu, 5 Desember 2026" />
              <Field label="Tanggal Resepsi" value={form.resepsiDate} onChange={set('resepsiDate')} placeholder="e.g. Minggu, 6 Desember 2026" />
              <div className="md:col-span-2">
                <Field label="Kisah Cinta / Love Story" value={form.coupleStory} onChange={set('coupleStory')} textarea placeholder="Kisah singkat perjalanan cinta..." />
              </div>
              <Field label="Hashtag" value={form.hashtag} onChange={set('hashtag')} placeholder="e.g. #OurWedding" />
            </>
          )}
          {cat === 'education' && (
            <>
              <Field label="Nama Lulusan" value={form.graduateName} onChange={set('graduateName')} placeholder="e.g. Adi Pratama" required />
              <Field label="Gelar / Program Studi" value={form.degreeName} onChange={set('degreeName')} placeholder="e.g. S1 Teknik Informatika" />
              <Field label="Perguruan Tinggi" value={form.institutionName} onChange={set('institutionName')} placeholder="e.g. Universitas Indonesia" />
              <Field label="Judul Acara" value={form.eventTitle} onChange={set('eventTitle')} placeholder="e.g. Wisuda / Graduation" />
              <Field label="Nama Orang Tua" value={form.parentsName} onChange={set('parentsName')} placeholder="e.g. Bpk. Rudi & Ibu Siti" />
            </>
          )}

          <Field label="Tanggal Acara" value={form.eventDate} onChange={set('eventDate')} placeholder="e.g. Sabtu, 13 Oktober 2026" required />
          <Field label="Jam Acara" value={form.eventTime} onChange={set('eventTime')} placeholder="e.g. 10.00 WIB - Selesai" />
          <Field label="Venue / Tempat" value={form.venue} onChange={set('venue')} placeholder="e.g. Masjid Baitul Ilmi" />
          <Field label="Alamat" value={form.address} onChange={set('address')} placeholder="e.g. Jl. Raya Cilandak, Jakarta Selatan" />
          <div className="md:col-span-2">
            <Field label="Link Google Maps (opsional)" value={form.googleMapsUrl} onChange={set('googleMapsUrl')} placeholder="https://maps.app.goo.gl/..." hint="Biarkan kosong untuk memakai pencarian otomatis." />
          </div>
          <div className="md:col-span-2">
            <Field label={`Ucapan / Doa (${cat})`} value={form.messageQuote} onChange={set('messageQuote')} textarea placeholder="Tulis ucapan atau doa untuk acara ini..." />
          </div>

          {/* Section: Musik */}
          <div className="md:col-span-2">
            <h3 className="font-body text-[11px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/40 pb-2 mb-4 mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">music_note</span> Musik Undangan
            </h3>
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low border border-outline-variant/40 rounded-xl p-4">
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-2xl ${musicEnabled ? 'text-emerald-600' : 'text-outline'}`} style={musicEnabled ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {musicEnabled ? 'music_note' : 'music_off'}
                </span>
                <div className="min-w-0">
                  <p className="font-body text-xs sm:text-sm font-bold text-on-surface truncate">
                    {musicEnabled ? (music?.title || template.musicTrackName) : 'Musik dimatikan'}
                  </p>
                  <p className="font-body text-[10px] sm:text-[11px] text-on-surface-variant">
                    {musicEnabled
                      ? music
                        ? 'Lagu khusus untuk undangan ini (admin yang memilih)'
                        : template.musicTrackName
                      : 'Tamu tidak akan mendengar musik pada undangan ini'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {musicEnabled && music && (
                  <button
                    onClick={() => handleMusicPreview({ uid: music.id, url: music.url })}
                    className="btn-micro min-h-[36px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">{previewingTrack === music.id ? 'stop_circle' : 'play_circle'}</span>
                    {previewingTrack === music.id ? 'Stop' : 'Preview'}
                  </button>
                )}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={musicEnabled}
                    onChange={(e) => setMusicEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                  <span className="font-body text-[11px] font-bold text-on-surface-variant">Aktif</span>
                </label>
              </div>
            </div>

            {musicEnabled && music && (
              <div className="mt-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <p className="font-body text-[10px] sm:text-[11px] font-bold text-on-surface-variant">
                    MULAI MUSIK DARI <span className="text-primary">(lewati intro)</span>
                  </p>
                  <span className="font-body text-[10px] font-bold text-primary">
                    ▶ mulai pada {formatStartTime(musicStartTime)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {START_TIME_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setMusicStartTime(s)}
                      className={`min-h-[30px] px-2.5 rounded-lg border font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                        musicStartTime === s
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-low hover:bg-surface-container-high border-outline-variant/60 text-on-surface-variant'
                      }`}
                    >
                      {formatStartTime(s)}
                    </button>
                  ))}
                </div>
                <p className="font-body text-[9px] sm:text-[10px] text-on-surface-variant mt-2">
                  Memutar dimulai dari titik yang dipilih sehingga tamu langsung mendengar bagian vokal lagu, bukan intro panjang.
                </p>
              </div>
            )}

            {musicEnabled && (
              <div className="mt-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3.5">
                <input
                  id="custom-music-input"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    handleMusicUpload(e.target.files?.[0] ?? null);
                    e.target.value = '';
                  }}
                />
                <p className="font-body text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">library_music</span>
                  Musik Kustom (file sendiri)
                </p>

                {customMusic ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-lg text-emerald-600 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                        music_note
                      </span>
                      <div className="min-w-0">
                        <p className="font-body text-[11px] font-bold text-on-surface truncate">{customMusic.name}</p>
                        <p className="font-body text-[9px] text-on-surface-variant">File lokal — tersimpan untuk undangan ini</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleMusicPreview({ uid: customMusic.id, url: customMusic.url })}
                        className="btn-micro min-h-[32px] px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">{previewingTrack === customMusic.id ? 'stop' : 'play_arrow'}</span>
                        {previewingTrack === customMusic.id ? 'Stop' : 'Preview'}
                      </button>
                      <label
                        htmlFor="custom-music-input"
                        className="btn-micro min-h-[32px] px-2.5 rounded-lg border border-outline-variant/60 text-on-surface-variant hover:text-primary hover:border-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">sync</span>
                        Ganti
                      </label>
                      <button
                        onClick={handleRemoveCustomMusic}
                        className="btn-micro min-h-[32px] px-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="custom-music-input"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-body text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#1d2d54] transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    {uploadingField === 'customMusic' ? 'Memproses...' : 'Upload Musik MP3'}
                  </label>
                )}

                <p className="font-body text-[9px] sm:text-[10px] text-on-surface-variant mt-2">
                  MP3 maksimal 4MB. Saat file terpasang, lagu dari library diganti dengan file Anda untuk undangan ini.
                </p>
              </div>
            )}

            {musicEnabled && (
              <div className="mt-3">
                <p className="font-body text-[10px] sm:text-[11px] font-bold text-on-surface-variant mb-2">
                  Pilih lagu dari library {categoryLabel}:
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <select
                    value={musicGenreFilter}
                    onChange={(e) => setMusicGenreFilter(e.target.value as 'All' | TrackGenre)}
                    className="font-body text-[10px] font-bold rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="All">Semua genre</option>
                    {TRACK_GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <select
                    value={musicVocalFilter}
                    onChange={(e) => setMusicVocalFilter(e.target.value as 'all' | 'vocal' | 'instrumental')}
                    className="font-body text-[10px] font-bold rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">Vokal + instrumental</option>
                    <option value="vocal">Hanya vokal</option>
                    <option value="instrumental">Hanya instrumental</option>
                  </select>
                </div>

                {(() => {
                  const rec = getCategoryRecommendation(cat);
                  return (
                    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5">
                      <p className="font-body text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                        ✨ {rec.title}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.tracks.slice(0, 6).map((t) => {
                          const isSelected = music?.id === t.uid;
                          return (
                            <button
                              key={t.uid}
                              onClick={() => {
                                setCustomMusic(null);
                                setMusic({ id: t.uid, title: t.title, url: t.url });
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-primary text-on-primary border-primary'
                                  : 'bg-white border-outline-variant/60 text-on-surface hover:border-primary'
                              }`}
                            >
                              {t.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredTracks.map((track) => {
                    const isSelected = music?.id === track.uid;
                    const isPreviewing = previewingTrack === track.uid;
                    return (
                      <div
                        key={track.uid}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setCustomMusic(null);
                          setMusic({ id: track.uid, title: track.title, url: track.url });
                        }}
                      >
                        <div className="min-w-0">
                          <p className="font-body text-[11px] font-bold text-on-surface truncate">{track.title}</p>
                          <p className="font-body text-[10px] text-on-surface-variant truncate">
                            {track.artist} • {track.durationSec}s
                          </p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className="px-1.5 py-px rounded-full bg-surface-container-low text-[9px] font-bold text-on-surface-variant border border-outline-variant/40">
                              {track.genre}
                            </span>
                            <span
                              className={`px-1.5 py-px rounded-full text-[9px] font-bold border ${
                                track.isVocal
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {track.isVocal ? 'Vokal' : 'Instrumental'}
                            </span>
                            {track.language && (
                              <span className="px-1.5 py-px rounded-full bg-surface-container-low text-[9px] font-bold text-on-surface-variant border border-outline-variant/40">
                                {track.language}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && (
                            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMusicPreview(track);
                            }}
                            className="btn-micro w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface flex items-center justify-center cursor-pointer"
                            title={isPreviewing ? 'Stop preview' : `Preview ${track.title}`}
                          >
                            <span className="material-symbols-outlined text-sm">{isPreviewing ? 'stop' : 'play_arrow'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredTracks.length === 0 && (
                    <p className="font-body text-[11px] text-on-surface-variant col-span-2 py-3 text-center">
                      Tidak ada lagu yang cocok dengan filter.
                    </p>
                  )}
                </div>

                {music && (
                  <button
                    onClick={() => {
                      setCustomMusic(null);
                      setMusic(null);
                    }}
                    className="mt-2 font-body text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">remove_circle</span>
                    Hapus pilihan lagu (kembali ke musik default template)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section: Foto */}
          <div className="md:col-span-2">
            <h3 className="font-body text-[11px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/40 pb-2 mb-4 mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">photo_library</span> Foto Customer
            </h3>
          </div>
          <div className="md:col-span-2">
            <PhotoField
              label="Foto Utama (Portrait)"
              value={form.portraitImage}
              onUpload={(file) => handlePhotoUpload('portraitImage', file)}
              onRemove={() => set('portraitImage')('')}
              uploading={uploadingField === 'portraitImage'}
              hint="Foto utama undangan. Admin dapat mengunggah foto customer langsung dari perangkat."
            />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {form.galleryItems.map((item, idx) => (
              <GalleryField
                key={item.id}
                id={item.id}
                label={`Foto Galeri ${idx + 1}`}
                value={item.url}
                removable={idx >= DEFAULT_GALLERY}
                uploading={uploadingField === `gallery-${item.id}`}
                onUpload={(file) => handleGalleryUpload(item.id, file)}
                onRemoveFoto={() => removeGalleryPhoto(item.id)}
                onRemoveGaleri={() => removeGalleryItem(item.id)}
              />
            ))}
          </div>
          <div className="md:col-span-2 mt-3 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleAddGaleri}
              disabled={form.galleryItems.length >= MAX_GALLERY}
              className="btn-micro inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-primary/50 text-primary hover:border-primary hover:bg-primary/5 font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Galeri
            </button>
            <p className="font-body text-[10px] text-on-surface-variant">
              {form.galleryItems.length}/{MAX_GALLERY} galeri
            </p>
            {form.galleryItems.length >= MAX_GALLERY && (
              <p className="font-body text-[10px] font-bold text-amber-600">
                Maksimal {MAX_GALLERY} foto galeri.
              </p>
            )}
          </div>

          {/* Section: Video */}
          <div className="md:col-span-2">
            <h3 className="font-body text-[11px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/40 pb-2 mb-4 mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">videocam</span> Video Undangan
            </h3>
          </div>
          <div className="md:col-span-2">
            <input
              id="video-input"
              type="file"
              accept="video/*,.mp4,.m4v,.webm,.mov,.ogv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                void handleVideoUpload(file);
                e.currentTarget.value = '';
              }}
            />
            {form.videoUrl ? (
              <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3">
                <video src={form.videoUrl} controls playsInline className="w-full max-h-64 rounded-lg bg-black/10 object-contain" />
                {form.videoName && (
                  <p className="mt-2 font-body text-[10px] text-on-surface-variant truncate">
                    <span className="material-symbols-outlined text-[12px] align-text-bottom">movie</span> {form.videoName}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="video-input"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-body text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#1d2d54] transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">file_upload</span>
                    Ganti Video
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface font-body text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-outline-variant/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Hapus Video
                  </button>
                </div>
              </div>
            ) : uploadingVideo ? (
              <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 flex flex-col items-center gap-3 text-center">
                <span className="material-symbols-outlined text-2xl animate-spin text-primary" style={{ animationDirection: 'reverse' }}>progress_activity</span>
                <p className="font-body text-[11px] font-bold text-on-surface">Mengunggah video... {videoProgress != null ? `${videoProgress}%` : ''}</p>
                <div className="w-full max-w-xs h-2 rounded-full bg-outline-variant/50 overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-200" style={{ width: `${videoProgress ?? 0}%` }} />
                </div>
                <p className="font-body text-[9px] sm:text-[10px] text-on-surface-variant">
                  Jangan tutup halaman ini hingga upload selesai.
                </p>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="video-input"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-body text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#1d2d54] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  Upload Video (MP4)
                </label>
                <p className="font-body text-[9px] sm:text-[10px] text-on-surface-variant mt-2">
                  MP4/WebM/MOV/OGV maksimal 50 MB. Video tampil otomatis di undangan publik untuk semua tamu — di semua
                  perangkat, termasuk ponsel, tanpa perlu login. Disarankan MP4.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Required name hint */}
        {!form.customerName && (
          <p className="mt-4 font-body text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <span className="font-bold">Saran:</span> isi minimal {requiredName} agar undangan tampil dengan data customer.
          </p>
        )}
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/40 px-4 sm:px-6 py-3">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
          <UiButton variant="secondary" size="md" icon="visibility" onClick={handlePreview}>
            Preview
          </UiButton>
          <div className="hidden sm:flex items-center justify-center font-body text-[10px] text-on-surface-variant px-1">
            {savedInvitation ? 'Perubahan tersimpan pada link yang sama.' : 'Belum disimpan'}
          </div>
          <div className="flex flex-1 gap-2 sm:gap-3 flex-col sm:flex-row">
            <UiButton variant="primary" size="lg" icon="save" onClick={() => handleSave(false)} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Undangan'}
            </UiButton>
            <UiButton variant="accent" size="lg" icon="public" iconFilled onClick={() => handleSave(true)} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan & Terbitkan'}
            </UiButton>
          </div>
        </div>
      </div>

      {/* Share panel after save */}
      {savedInvitation && (
        <div className="mt-6">
          <SharePanel
            invitation={savedInvitation}
            title={invitationTitle}
            onPublish={() => {
              const res = updateInvitation(savedInvitation.id, { status: 'published' });
              if (res) {
                setSavedInvitation(res);
                setStatus('published');
                setToast('Undangan berhasil diterbitkan.');
                setToastIcon('check_circle');
              }
            }}
            onOpenInvitation={() => {
              if (onOpenInvitation) onOpenInvitation(savedInvitation.slug);
              else window.open(`/i/${savedInvitation.slug}`, '_blank', 'noopener,noreferrer');
            }}
          />
        </div>
      )}

      {/* Preview overlay */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            className="fixed inset-0 z-[90] bg-black flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0 z-10">
              <div className="flex items-center gap-2 min-w-0">
                <Eye size={18} className="text-amber-400 shrink-0" aria-hidden="true" />
                <span className="font-headline text-sm font-bold text-white truncate">Preview Undangan</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline font-body text-[10px] text-slate-400">
                  Preview tidak mengubah data tersimpan
                </span>
                <UiButton variant="danger" size="sm" icon="close" onClick={() => setPreviewOpen(false)}>
                  Tutup
                </UiButton>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              <TemplateDemoView
                key={JSON.stringify(previewForm)}
                template={template}
                isInvitation
                invitationSlug={savedInvitation?.slug || 'preview'}
                invitationTitle={invitationTitle}
                invitationPhone={form.customerPhone || null}
                eventDetailsOverride={buildCustomData(cat, previewForm) as EventDetails}
                wishesOverride={template.sampleWishes}
                musicOverride={musicEnabled ? { ...music, startTime: musicStartTime } : null}
                disableMusic={!musicEnabled}
                videoOverride={
                  previewForm.videoUrl
                    ? { url: previewForm.videoUrl, type: previewForm.videoType, name: previewForm.videoName }
                    : null
                }
                onOpenWhatsApp={() => undefined}
                onBackToCatalog={() => setPreviewOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        open={!!toast}
        message={toast}
        icon={toastIcon}
        onClose={() => setToast('')}
      />
    </div>
  );
};
