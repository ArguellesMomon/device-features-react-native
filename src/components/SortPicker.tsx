import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────
export type SortOption = 'default' | 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc';

interface SortConfig {
  key: SortOption;
  label: string;
  sublabel: string;
  icon: string;
}

const SORT_OPTIONS: SortConfig[] = [
  { key: 'default',    label: 'Default',       sublabel: 'As saved',         icon: '⊞' },
  { key: 'date_desc',  label: 'Newest First',  sublabel: 'Latest → Oldest',  icon: '↓' },
  { key: 'date_asc',   label: 'Oldest First',  sublabel: 'Oldest → Latest',  icon: '↑' },
  { key: 'alpha_asc',  label: 'A → Z',         sublabel: 'Alphabetical',      icon: 'A' },
  { key: 'alpha_desc', label: 'Z → A',         sublabel: 'Reverse alphabet',  icon: 'Z' },
];

interface Props {
  current: SortOption;
  onChange: (sort: SortOption) => void;
}

const SortPicker: React.FC<Props> = ({ current, onChange }) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const currentConfig = SORT_OPTIONS.find((o) => o.key === current) ?? SORT_OPTIONS[0];

  const handleSelect = (key: SortOption) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          s.trigger,
          { backgroundColor: theme.inputBg, borderColor: current !== 'default' ? theme.primary : theme.border },
          pressed && { opacity: 0.75 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Sort entries"
      >
        <Text style={[s.triggerIcon, { color: current !== 'default' ? theme.primary : theme.subtext }]}>
          {currentConfig.icon}
        </Text>
        <Text style={[s.triggerLabel, { color: current !== 'default' ? theme.primary : theme.subtext }]}>
          {currentConfig.label}
        </Text>
        {/* Active indicator dot */}
        {current !== 'default' && (
          <View style={[s.activeDot, { backgroundColor: theme.primary }]} />
        )}
      </Pressable>

      {/* ── Bottom sheet modal ─────────────────────────────────────────── */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop */}
        <Pressable style={s.backdrop} onPress={() => setOpen(false)} />

        {/* Sheet */}
        <View style={[s.sheet, { backgroundColor: theme.card }]}>
          {/* Handle bar */}
          <View style={[s.handle, { backgroundColor: theme.border }]} />

          {/* Header */}
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: theme.text }]}>Sort Memories</Text>
            <Pressable
              onPress={() => setOpen(false)}
              style={({ pressed }) => [s.closeBtn, { backgroundColor: theme.inputBg }, pressed && { opacity: 0.6 }]}
            >
              <Text style={[s.closeBtnText, { color: theme.subtext }]}>✕</Text>
            </Pressable>
          </View>

          {/* Options */}
          <View style={s.optionsList}>
            {SORT_OPTIONS.map((option, index) => {
              const isActive = current === option.key;
              const isLast = index === SORT_OPTIONS.length - 1;
              return (
                <View key={option.key}>
                  <Pressable
                    onPress={() => handleSelect(option.key)}
                    style={({ pressed }) => [
                      s.optionRow,
                      isActive && { backgroundColor: theme.primaryLight },
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Sort by ${option.label}`}
                  >
                    {/* Icon badge */}
                    <View style={[
                      s.optionIconWrap,
                      { backgroundColor: isActive ? theme.primary : theme.inputBg },
                    ]}>
                      <Text style={[
                        s.optionIcon,
                        { color: isActive ? '#ffffff' : theme.subtext },
                      ]}>
                        {option.icon}
                      </Text>
                    </View>

                    {/* Labels */}
                    <View style={s.optionTextWrap}>
                      <Text style={[s.optionLabel, { color: isActive ? theme.primary : theme.text }]}>
                        {option.label}
                      </Text>
                      <Text style={[s.optionSublabel, { color: theme.subtext }]}>
                        {option.sublabel}
                      </Text>
                    </View>

                    {/* Check mark if active */}
                    {isActive && (
                      <View style={[s.checkWrap, { backgroundColor: theme.primary }]}>
                        <Text style={s.checkText}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                  {!isLast && <View style={[s.rowDivider, { backgroundColor: theme.border }]} />}
                </View>
              );
            })}
          </View>

          {/* Reset button — only shown when not default */}
          {current !== 'default' && (
            <Pressable
              onPress={() => handleSelect('default')}
              style={({ pressed }) => [
                s.resetBtn,
                { borderColor: theme.border, backgroundColor: theme.inputBg },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[s.resetBtnText, { color: theme.subtext }]}>Reset to Default</Text>
            </Pressable>
          )}
        </View>
      </Modal>
    </>
  );
};

const s = StyleSheet.create({
  // ── Trigger ──
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    position: 'relative',
  },
  triggerIcon: { fontSize: 13, fontWeight: '900', width: 14, textAlign: 'center' },
  triggerLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  activeDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Modal ──
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 13, fontWeight: '700' },

  // ── Options ──
  optionsList: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
  },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: { fontSize: 16, fontWeight: '900' },
  optionTextWrap: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 15, fontWeight: '700' },
  optionSublabel: { fontSize: 11, fontWeight: '500', opacity: 0.7 },
  checkWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  rowDivider: { height: 1, marginLeft: 68 },

  // ── Reset ──
  resetBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: { fontSize: 13, fontWeight: '700' },
});

export default SortPicker;