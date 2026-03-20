import { StyleSheet, Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CARD_WIDTH = SCREEN_WIDTH - 32;
export const CARD_HEIGHT = CARD_WIDTH * 0.78; // More rectangular, not square
export const PHOTO_HEIGHT = CARD_HEIGHT * 0.62; // Top photo portion
export const INFO_HEIGHT = CARD_HEIGHT * 0.38;  // Solid bottom section

export const styles = StyleSheet.create({
  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },

  // ── Photo section (top) ───────────────────────────────────────────────────
  photoSection: {
    width: '100%',
    height: PHOTO_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Top bar overlaid on photo
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  indexBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  indexText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 13 },

  // ── Solid info section (bottom) ───────────────────────────────────────────
  infoSection: {
    height: INFO_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },

  // Top part of info: location + photo count
  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f07840',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Title
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    letterSpacing: -0.4,
    flex: 1,
  },

  // Bottom part of info: description + date/hint
  infoBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  descPreview: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    opacity: 0.7,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.5,
    letterSpacing: 0.2,
  },

  // ── Fullscreen Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenPhoto: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  modalBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 44,
    gap: 4,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalAddress: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    lineHeight: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});