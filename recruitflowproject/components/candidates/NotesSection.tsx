import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notesService, Note } from '@/services/notesService';

interface NotesSectionProps {
  candidateId: string;
  userId: string;
  userName: string;
}

export function NotesSection({ candidateId, userId, userName }: NotesSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<Note['note_type']>('general');
  const [loading, setLoading] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingNoteType, setEditingNoteType] = useState<Note['note_type']>('general');

  const noteTypes: Array<{ value: Note['note_type']; label: string }> = [
    { value: 'general', label: 'General' },
    { value: 'interview', label: 'Interview' },
    { value: 'phone_screen', label: 'Phone Screen' },
    { value: 'reference', label: 'Reference' },
    { value: 'follow_up', label: 'Follow Up' },
  ];

  useEffect(() => {
    loadNotes();
    
    // Subscribe to realtime updates
    const unsubscribe = notesService.subscribeToNotes(candidateId, (note) => {
      setNotes((prev) => {
        const exists = prev.find((n) => n.id === note.id);
        if (exists) {
          return prev.map((n) => (n.id === note.id ? note : n));
        }
        return [note, ...prev];
      });
    });

    return unsubscribe;
  }, [candidateId]);

  const loadNotes = async () => {
    try {
      const data = await notesService.getNotes(candidateId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      await notesService.createNote(candidateId, newNote.trim(), noteType, userId, userName);
      setNewNote('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Failed to add note:', error);
      Alert.alert('Error', 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
    setEditingNoteType(note.note_type);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editingContent.trim()) return;

    try {
      // Update note content and type
      await notesService.updateNote(noteId, editingContent.trim());
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, content: editingContent.trim(), note_type: editingNoteType } : n))
      );
      setEditingNoteId(null);
      setEditingContent('');
      setEditingNoteType('general');
    } catch (error) {
      console.error('Failed to update note:', error);
      Alert.alert('Error', 'Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
    setEditingNoteType('general');
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesService.deleteNote(noteId);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
          } catch (error) {
            console.error('Failed to delete note:', error);
            Alert.alert('Error', 'Failed to delete note');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNote = ({ item }: { item: Note }) => {
    const isEditing = editingNoteId === item.id;

    return (
      <Card style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Badge label={item.note_type.replace('_', ' ')} variant="primary" size="small" />
          <View style={styles.noteActions}>
            {!isEditing && (
              <>
                <TouchableOpacity onPress={() => handleEditNote(item)} style={styles.actionButton}>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteNote(item.id)} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {isEditing ? (
          <View>
            {/* Note Type Selector */}
            <View style={styles.typeSelector}>
              {noteTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        editingNoteType === type.value ? colors.primary : colors.backgroundSecondary,
                    },
                  ]}
                  onPress={() => setEditingNoteType(type.value)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color: editingNoteType === type.value ? '#fff' : colors.textSecondary,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
              value={editingContent}
              onChangeText={setEditingContent}
              multiline
              autoFocus
            />
            <View style={styles.noteFooter}>
              <Text style={[styles.noteAuthor, { color: colors.textSecondary }]}>
                {item.created_by_name}
              </Text>
              <Text style={[styles.noteDate, { color: colors.textMuted }]}>
                {formatDate(item.created_at)}
              </Text>
            </View>
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={[styles.editButton, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSaveEdit(item.id)}
                style={[styles.editButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.editButtonText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.noteContent, { color: colors.text }]}>{item.content}</Text>
            <View style={styles.noteFooter}>
              <Text style={[styles.noteAuthor, { color: colors.textSecondary }]}>
                {item.created_by_name}
              </Text>
              <Text style={[styles.noteDate, { color: colors.textMuted }]}>
                {formatDate(item.created_at)}
              </Text>
            </View>
          </>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Notes</Text>
        <TouchableOpacity onPress={() => setIsAddingNote(!isAddingNote)}>
          <Ionicons
            name={isAddingNote ? 'close-circle' : 'add-circle'}
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {isAddingNote && (
        <Card style={styles.addNoteCard}>
          {/* Note Type Selector */}
          <View style={styles.typeSelector}>
            {noteTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      noteType === type.value ? colors.primary : colors.backgroundSecondary,
                  },
                ]}
                onPress={() => setNoteType(type.value)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color: noteType === type.value ? colors.background : colors.textSecondary,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note Input */}
          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Write a note..."
            placeholderTextColor={colors.textMuted}
            value={newNote}
            onChangeText={setNewNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Button
            title="Add Note"
            onPress={handleAddNote}
            loading={loading}
            disabled={!newNote.trim()}
            variant="primary"
          />
        </Card>
      )}

      {/* Notes List */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No notes yet. Add one to get started!
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  addNoteCard: {
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    minHeight: 100,
  },
  noteCard: {
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minHeight: 80,
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteDate: {
    fontSize: 11,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
  },
});
