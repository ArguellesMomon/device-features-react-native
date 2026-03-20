import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_COL = (SCREEN_WIDTH - 40 - 8) / 2;

// Polaroid thumb sizes
export const POLAROID_W = (SCREEN_WIDTH - 40 - 16) / 2;
export const POLAROID_IMG_H = POLAROID_W * 0.78;

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  container: { paddingBottom: 100 },

  // ── Hero — full bleed, tall ───────────────────────────────────────────────
  heroWrap: { width: '100%', height: 300, position: 'relative' },
  heroPhoto: { width: '100%', height: 300 },
  heroVignette: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
    backgroundColor: 'rgba(0,0,0,0.44)',
  },
  heroTouchable: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  // Film strip perforations on left edge of hero
  filmStrip: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    gap: 0,
  },
  filmHole: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Location + date overlaid
  heroBottom: {
    position: 'absolute', bottom: 0, left: 28, right: 0,
    padding: 16, paddingBottom: 18, gap: 5,
  },
  locationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4, // Square pill for stamp feel
    paddingHorizontal: 10, paddingVertical: 4,
  },
  locationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f07840' },
  locationText: { color: '#ffffff', fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  heroDate: { color: 'rgba(255,255,255,0.52)', fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', paddingLeft: 2 },

  // Edit FAB — camera icon style
  editFab: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 6,
  },
  editFabText: { color: '#ffffff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  // ── Passport stamp band ───────────────────────────────────────────────────
  stampBand: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderStyle: 'dashed',
  },
  stampLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stampIcon: { fontSize: 22 },
  stampLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  stampValue: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  stampDivider: { width: 1, height: 32, opacity: 0.2 },
  stampDate: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textAlign: 'right' },
  stampDateSub: { fontSize: 10, opacity: 0.55, textAlign: 'right', marginTop: 2 },

  // ── Body ─────────────────────────────────────────────────────────────────
  body: { paddingHorizontal: 20, paddingTop: 24, gap: 28 },

  // ── Title ─────────────────────────────────────────────────────────────────
  titleWrap: { gap: 4 },
  titleEyebrow: {
    fontSize: 10, fontWeight: '800', letterSpacing: 2.5,
    textTransform: 'uppercase', marginBottom: 4,
  },
  titleText: { fontSize: 30, fontWeight: '900', lineHeight: 36, letterSpacing: -0.8 },
  titleInput: {
    fontSize: 22, fontWeight: '800',
    borderWidth: 0, borderBottomWidth: 2,
    paddingHorizontal: 0, paddingVertical: 8,
    lineHeight: 30,
  },

  // ── Rule line divider ─────────────────────────────────────────────────────
  ruleLine: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  ruleLineBar: { flex: 1, height: 1 },
  ruleLineDot: {
    width: 6, height: 6, borderRadius: 3,
  },

  // ── Notes — lined paper feel ──────────────────────────────────────────────
  notesWrap: { gap: 12 },
  notesSectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  descText: { fontSize: 15, lineHeight: 30 },  // lineHeight matches ruled lines
  descLine: {
    borderBottomWidth: 1, paddingBottom: 8, marginBottom: 0,
  },
  descEmpty: { fontSize: 14, fontStyle: 'italic', lineHeight: 24, opacity: 0.45 },
  descInput: {
    fontSize: 15, lineHeight: 28,
    borderWidth: 0, borderBottomWidth: 1.5,
    paddingHorizontal: 0, paddingVertical: 0,
    minHeight: 120, textAlignVertical: 'top',
    paddingBottom: 8,
  },
  charCount: { fontSize: 10, letterSpacing: 0.5, opacity: 0.5, textAlign: 'right', marginTop: 4 },

  // ── Inline ✓ / ✕ buttons ─────────────────────────────────────────────────
  inlineBtn: {
    flex: 1, height: 38, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  inlineBtnText: { fontSize: 16, fontWeight: '800' },

  // ── Polaroid gallery ──────────────────────────────────────────────────────
  galleryWrap: { gap: 14 },
  gallerySectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoCountChip: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 4, borderWidth: 1,
  },
  photoCountChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  polaroidGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  polaroid: {
    width: POLAROID_W,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    padding: 6,
    paddingBottom: 20,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    position: 'relative',
  },
  polaroidImage: {
    width: '100%',
    height: POLAROID_IMG_H,
    borderRadius: 2,
  },
  polaroidCaption: {
    position: 'absolute', bottom: 4, left: 0, right: 0,
    alignItems: 'center',
  },
  polaroidCaptionLine: {
    width: '60%', height: 1, opacity: 0.15,
  },
  polaroidRemove: {
    position: 'absolute', top: -8, right: -8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e53e3e',
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
    zIndex: 10,
  },
  polaroidRemoveText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  // Add photo button
  addPhotoBtn: {
    width: POLAROID_W,
    height: POLAROID_IMG_H + 26,
    borderRadius: 3,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPhotoIcon: { fontSize: 28 },
  addPhotoBtnText: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },

  // Collage fallback styles (4+ photos)
  collage4Wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  collage4Item: { width: PHOTO_COL, height: PHOTO_COL, borderRadius: 8, overflow: 'hidden' },
  collage4More: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  collage4MoreText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  collageImg: { width: '100%', height: '100%' },
  photoWrap: { position: 'relative' },
  removeBadge: {
    position: 'absolute', top: -8, right: -8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e53e3e',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  removeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  // ── Edit actions ──────────────────────────────────────────────────────────
  editActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  saveBtn: {
    flex: 2, height: 50, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  disabled: { opacity: 0.45 },

  // ── Fullscreen modal ──────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  fullscreenPhoto: { width: '100%', height: '100%' },
  modalCloseBtn: {
    position: 'absolute', top: 52, right: 20,
    width: 42, height: 42, borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});