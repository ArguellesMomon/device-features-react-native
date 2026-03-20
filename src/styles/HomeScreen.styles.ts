import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, letterSpacing: 0.5 },

  // ── Header banner ─────────────────────────────────────────────────────────
  headerBanner: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },

  bannerAccent: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.08,
  },
  bannerAccent2: {
    position: 'absolute',
    bottom: -20,
    left: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.06,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoStamp: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  logoStampImage: {
    width: 70,
    height: 60,
  },
  logoTextWrap: { gap: 1 },
  logoEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  greetingPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  greetingPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Big editorial headline ────────────────────────────────────────────────
  headlineWrap: { gap: 6, marginBottom: 22 },
  headlineSub: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headlineMain: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 40,
  },
  headlineMainAccent: {},

  // ── Stats strip ───────────────────────────────────────────────────────────
  statsStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  statChipIcon: { fontSize: 18 },
  statChipRight: { gap: 1 },
  statChipNumber: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statChipLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },

  // ── Divider with label ────────────────────────────────────────────────────
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  dividerDiamond: {
    width: 6, height: 6,
    borderWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: { paddingTop: 2, paddingBottom: 120 },
  emptyList: { flex: 1 },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
    paddingBottom: 80,
  },
  emptyMapWrap: {
    width: 110,
    height: 110,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  emptyMapEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7,
  },
  emptyHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  emptyHintLine: { flex: 1, height: 1, opacity: 0.3 },
  emptyHintText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── FAB ───────────────────────────────────────────────────────────────────
  fabWrap: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    height: 56,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  fabPlusWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPlus: { color: '#ffffff', fontSize: 20, fontWeight: '300', lineHeight: 22 },
  fabText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});