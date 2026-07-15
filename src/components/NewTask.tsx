import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, PriorityType, PRIORITY_COLORS } from '../types';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';

interface NewTaskProps {
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed'>) => void;
}

const categories = [
  { name: 'Trabalho', color: 'rgba(59,130,246,0.1)' },
  { name: 'Estudos', color: 'rgba(168,85,247,0.1)' },
  { name: 'Saúde', color: 'rgba(34,197,94,0.1)' },
  { name: 'Conteúdo', color: 'rgba(236,72,153,0.1)' },
  { name: 'Negócios', color: 'rgba(249,115,22,0.1)' },
  { name: 'Pessoal', color: 'rgba(156,163,175,0.1)' },
];

const priorities: PriorityType[] = ['Alta', 'Média', 'Baixa'];

export default function NewTask({ onClose, onSave }: NewTaskProps) {
  const colors = useThemeColors();
  const $ = useT();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState('Trabalho');
  const [priority, setPriority] = useState<PriorityType>('Média');
  const [repetition, setRepetition] = useState($('noRepeat'));
  const [reminder, setReminder] = useState($('10minBefore'));

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      category,
      priority,
      color: PRIORITY_COLORS[priority].hex,
      repetition,
      reminder,
    });
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.sheet, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
      >
        <View style={[styles.handle, { backgroundColor: colors.surfaceLight }]} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{$('scheduleNewFocus')}</Text>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{$('whatWillYouFocus')}</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={title} onChangeText={setTitle} placeholder={$('titlePlaceholder')} placeholderTextColor={colors.textMuted} />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{$('focusDetails')}</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }, styles.textarea]} value={description} onChangeText={setDescription} placeholder={$('detailsPlaceholder')} placeholderTextColor={colors.textMuted} multiline numberOfLines={3} />
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textMuted }]}><Ionicons name="calendar-outline" size={14} color={colors.text} /> {$('date')}</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textMuted }]}><Ionicons name="time-outline" size={14} color={colors.text} /> {$('alarmTime')}</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor={colors.textMuted} />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{$('category')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {categories.map((cat) => {
                  const sel = category === cat.name;
                  return (
                    <Pressable key={cat.name} onPress={() => setCategory(cat.name)}
                      style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }, sel && { backgroundColor: colors.accentLight, borderColor: colors.accentBorder }]}>
                      <Text style={[styles.chipText, { color: colors.textMuted }, sel && { color: colors.text, fontWeight: '600' }]}>{cat.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={[styles.field, { flex: 1 }]}>
                <View style={[styles.prioBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}><Ionicons name="flag-outline" size={14} color={colors.text} /> {$('priority')}</Text>
                      <View style={{ gap: 8 }}>
                        {priorities.map((p) => {
                          const sel = priority === p;
                          const pc = PRIORITY_COLORS[p];
                          const pLabel = p === 'Alta' ? $('high') : p === 'Média' ? $('medium') : $('low');
                          return (
                            <Pressable key={p} onPress={() => setPriority(p)}
                              style={[styles.prioItem, { backgroundColor: colors.surface, borderColor: colors.border }, sel && { backgroundColor: `${pc.hex}1A`, borderColor: `${pc.hex}4D` }]}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: pc.hex }} />
                                <View style={{ flexShrink: 1 }}>
                                  <Text style={{ fontSize: 14, fontWeight: '600', color: sel ? colors.text : colors.textMuted }} numberOfLines={1}>{pLabel}</Text>
                                  <Text style={{ fontSize: 10, color: sel ? colors.textSecondary : colors.textMuted, opacity: 0.7 }} numberOfLines={1}>{pc.desc}</Text>
                                </View>
                              </View>
                              {sel && <Ionicons name="checkmark" size={12} color={colors.text} />}
                            </Pressable>
                          );
                        })}
                      </View>
                </View>
              </View>
              <View style={[styles.field, { flex: 1, justifyContent: 'space-between' }]}>
                <View style={{ gap: 14 }}>
                  <View style={{ gap: 6 }}>
                    <Text style={[styles.label, { color: colors.textMuted }]}><MaterialCommunityIcons name="repeat" size={14} color={colors.text} /> {$('repetition')}</Text>
                    <PickerSelect value={repetition} onChange={setRepetition} options={[$('noRepeat'), $('daily'), $('weekly'), $('monthly')]} colors={colors} />
                  </View>
                  <View style={{ gap: 6 }}>
                    <Text style={[styles.label, { color: colors.textMuted }]}><Ionicons name="notifications-outline" size={14} color={colors.text} /> {$('reminder')}</Text>
                    <PickerSelect value={reminder} onChange={setReminder} options={[$('atTaskTime'), $('5minBefore'), $('10minBefore'), $('15minBefore')]} colors={colors} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable onPress={onClose} style={[styles.cancelBtn, { borderColor: colors.border }]}><Text style={[styles.cancelText, { color: colors.textMuted }]}>{$('cancelTask')}</Text></Pressable>
          <Pressable onPress={handleSubmit} disabled={!title.trim()}
            style={[styles.saveBtn, { backgroundColor: colors.accentBg }, !title.trim() && { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.saveText, { color: colors.accentText }, !title.trim() && { color: colors.textMuted }]}>{$('saveTask')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function PickerSelect({ value, onChange, options, colors }: { value: string; onChange: (v: string) => void; options: string[]; colors: any }) {
  return (
    <View style={[styles.pickerWrap, { borderColor: colors.border }]}>
      {options.map((opt) => (
        <Pressable key={opt} onPress={() => onChange(opt)}
          style={[styles.pickerOption, { borderBottomColor: colors.border }, value === opt && styles.pickerOptionSel]}>
          <Text style={[styles.pickerText, { color: colors.textMuted }, value === opt && { color: colors.text, fontWeight: '600' }]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', inset: 0, zIndex: 50, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '92%', borderBottomWidth: 0 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  formScroll: { flexGrow: 0 },
  form: { padding: 24, gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 15, fontWeight: '600', flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 15, fontWeight: '500' },
  prioBox: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 12 },
  prioItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  pickerWrap: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  pickerOption: { paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5 },
  pickerOptionSel: { backgroundColor: 'rgba(59,130,246,0.1)' },
  pickerText: { fontSize: 15 },
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '500' },
  saveBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveBtnDisabled: { borderWidth: 1 },
  saveText: { fontSize: 15, fontWeight: '700' },
});
