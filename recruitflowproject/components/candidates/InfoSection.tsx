import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';

interface InfoItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  link?: string;
}

interface InfoSectionProps {
  title: string;
  items: InfoItem[];
  onEdit?: () => void;
}

export function InfoSection({ title, items, onEdit }: InfoSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handlePress = async (link?: string) => {
    if (!link) return;

    try {
      let normalized = link.trim();

      // Add https:// for plain web URLs (e.g. "www.site.com")
      if (
        !normalized.startsWith('http://') &&
        !normalized.startsWith('https://') &&
        !normalized.startsWith('mailto:') &&
        !normalized.startsWith('tel:')
      ) {
        normalized = `https://${normalized}`;
      }

      const canOpen = await Linking.canOpenURL(normalized);
      if (!canOpen) {
        Alert.alert('Not Supported', 'This action cannot be opened on this device or simulator.');
        return;
      }

      await Linking.openURL(normalized);
    } catch (error) {
      console.error('Failed to open link:', error);
      Alert.alert('Error', 'Unable to open this link on your device.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <Card>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.item,
              index < items.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              },
            ]}
            onPress={() => handlePress(item.link)}
            disabled={!item.link}
            activeOpacity={item.link ? 0.7 : 1}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{item.value}</Text>
            </View>
            {item.link && (
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            )}
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    padding: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
});
