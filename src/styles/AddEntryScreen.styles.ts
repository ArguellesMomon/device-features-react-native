import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingBottom: 80 },

  // ── Hero photo zone ───────────────────────────────────────────────────────
  photoZone: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: '#111',
  },
  photo: { width: '100%', height: '100%' },

  // Placeholder — camera viewfinder style
  // Placeholder — simple clean camera prompt
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  photoPlaceholderIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 4,
  },
  photoPlaceholderEmoji: { fontSize: 32 },
  photoPlaceholderTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  photoPlaceholderSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 60,
  },

  // Photo action buttons overlay at bottom
  photoActions: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  photoActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
  },
  photoActionIcon: { fontSize: 16 },
  photoActionText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },

  // Retake / change strip (when photo is taken)
  retakeStrip: {
    position: 'absolute',
    top: 12, right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retakeBtnText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // ── Film strip accent below photo ─────────────────────────────────────────
  filmBar: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
    overflow: 'hidden',
  },
  filmHole: { width: 12, height: 12, borderRadius: 6 },

  // ── Body ─────────────────────────────────────────────────────────────────
  body: { padding: 20, gap: 24 },

  // ── Metadata card (location + timestamp) ─────────────────────────────────
  metaCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  metaRowDivider: { height: 1 },
  metaIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaIconText: { fontSize: 16 },
  metaContent: { flex: 1, gap: 2 },
  metaLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' },
  metaValue: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  metaEmpty: { fontSize: 13, fontStyle: 'italic', opacity: 0.5 },
  fetchingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fetchingText: { fontSize: 13 },

  // ── Form section ──────────────────────────────────────────────────────────
  formSection: { gap: 20 },
  formEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: -8,
  },

  // Title input — underline only, editorial style
  titleInputWrap: { gap: 6 },
  titleFieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  titleLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  charCount: { fontSize: 10, opacity: 0.5, fontWeight: '600' },
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    borderBottomWidth: 2,
    paddingBottom: 8,
    paddingTop: 4,
  },

  // Description — clean textarea
  descWrap: { gap: 6 },
  descFieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  descLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  optionalText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  descInput: {
    fontSize: 15,
    lineHeight: 26,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    minHeight: 120,
    textAlignVertical: 'top',
  },

  // ── Inline ✓ / ✕ per field ────────────────────────────────────────────────
  inlineActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  inlineBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineBtnText: { fontSize: 15, fontWeight: '800' },

  // ── Save button ────────────────────────────────────────────────────────────
  saveWrap: { gap: 10 },
  saveBtn: {
    height: 58,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnIcon: { fontSize: 15 },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  disabled: { opacity: 0.42 },
  hint: { fontSize: 11, textAlign: 'center', opacity: 0.5, letterSpacing: 0.3 },
});