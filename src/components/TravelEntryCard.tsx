import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TravelEntry } from '../types';

interface Props {
  entry: TravelEntry;
  onRemove: (id: string) => Promise<void>;
}

const TravelEntryCard: React.FC<Props> = ({ entry, onRemove }) => {
  const { theme } = useTheme();
  const [removing, setRemoving] = useState(false);

  // Format ISO date to readable string
  const formattedDate = (() => {
    try {
      return new Date(entry.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  })();

  const handleRemove = () => {
    Alert.alert(
      'Remove Entry',
      'Are you sure you want to remove this travel memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await onRemove(entry.id);
            } catch {
              Alert.alert('Error', 'Failed to remove entry. Please try again.');
            } finally {
              setRemoving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      {/* Photo */}
      <Image
        source={{ uri: entry.imageUri }}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel={`Travel photo at ${entry.address}`}
      />

      {/* Details */}
      <View style={styles.details}>
        {/* Address */}
        <View style={styles.row}>
          <Text style={styles.pin}>📍</Text>
          <Text
            style={[styles.address, { color: theme.text }]}
            numberOfLines={2}
          >
            {entry.address}
          </Text>
        </View>

        {/* Date */}
        <Text style={[styles.date, { color: theme.subtext }]}>
          🕐 {formattedDate}
        </Text>

        {/* Remove button */}
        <TouchableOpacity
          onPress={handleRemove}
          disabled={removing}
          style={[
            styles.removeBtn,
            { backgroundColor: theme.dangerLight, borderColor: theme.danger },
          ]}
          accessibilityLabel="Remove this entry"
          accessibilityRole="button"
        >
          {removing ? (
            <ActivityIndicator size="small" color={theme.danger} />
          ) : (
            <Text style={[styles.removeText, { color: theme.danger }]}>
              🗑 Remove
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  details: {
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  pin: {
    fontSize: 16,
    marginTop: 1,
  },
  address: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  date: {
    fontSize: 12,
  },
  removeBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default TravelEntryCard;