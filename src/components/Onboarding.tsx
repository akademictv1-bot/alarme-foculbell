import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile } from '../types';
import { useThemeColors } from '../lib/ThemeContext';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const professions = [
  { id: 'Estudante', label: 'Estudante', icon: 'graduation-cap' as const, family: 'MaterialCommunityIcons' as const },
  { id: 'Empreendedor', label: 'Empreendedor', icon: 'briefcase-outline' as const, family: 'Ionicons' as const },
  { id: 'Criador de conteúdo', label: 'Criador de conteúdo', icon: 'videocam-outline' as const, family: 'Ionicons' as const },
  { id: 'Desenvolvedor', label: 'Desenvolvedor', icon: 'code-outline' as const, family: 'Ionicons' as const },
  { id: 'Freelancer', label: 'Freelancer', icon: 'laptop-outline' as const, family: 'Ionicons' as const },
  { id: 'Fitness', label: 'Fitness', icon: 'dumbbell' as const, family: 'MaterialCommunityIcons' as const },
  { id: 'Trabalho (Geral)', label: 'Trabalho (Geral)', icon: 'business-outline' as const, family: 'Ionicons' as const },
];

const goals = [
  { id: 'Ser mais produtivo', label: 'Ser mais produtivo', subtitle: 'Aproveitar cada minuto do dia ao máximo.', icon: 'flash-outline' as const, family: 'Ionicons' as const },
  { id: 'Melhorar rotina', label: 'Melhorar rotina', subtitle: 'Criar hábitos saudáveis e consistentes.', icon: 'calendar-outline' as const, family: 'Ionicons' as const },
  { id: 'Organizar tarefas', label: 'Organizar tarefas', subtitle: 'Listar e gerenciar todas as obrigações diárias.', icon: 'checkbox-outline' as const, family: 'Ionicons' as const },
  { id: 'Parar procrastinação', label: 'Parar procrastinação', subtitle: 'Vencer o adiamento e focar no que importa.', icon: 'time-outline' as const, family: 'Ionicons' as const },
  { id: 'Melhorar disciplina', label: 'Melhorar disciplina', subtitle: 'Alcançar metas de longo prazo com determinação.', icon: 'crosshair-outline' as const, family: 'Ionicons' as const },
];

function ProfIcon({ icon, family, color }: { icon: string; family: string; color: string }) {
  if (family === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={icon as any} size={18} color={color} />;
  }
  return <Ionicons name={icon as any} size={18} color={color} />;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const colors = useThemeColors();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('Desenvolvedor');
  const [mainGoal, setMainGoal] = useState('Ser mais produtivo');

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      const finishedProfile: UserProfile = {
        name: name.trim() || 'Focado',
        profession,
        mainGoal,
        dailyEnergy: 85,
        onboardingCompleted: true,
        settings: { sound: true, vibration: true, notifications: true, darkTheme: true },
      };
      onComplete(finishedProfile);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSkip = () => {
    onComplete({
      name: name.trim() || 'Focado',
      profession,
      mainGoal,
      dailyEnergy: 85,
      onboardingCompleted: true,
      settings: { sound: true, vibration: true, notifications: true, darkTheme: true },
    });
  };

  const progressWidth = step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%';

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {step > 1 ? (
              <Pressable onPress={handleBack} style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="arrow-back" size={16} color={colors.textMuted} />
              </Pressable>
            ) : (
              <View style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} />
            )}
            <Text style={[styles.stepText, { color: colors.textMuted }]}>Passo {step} de 3</Text>
            {step < 3 && (
              <Pressable onPress={handleSkip}>
                <Text style={[styles.skipText, { color: colors.textMuted }]}>Pular</Text>
              </Pressable>
            )}
            {step === 3 && <View style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} />}
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
            <View style={[styles.progressFill, { width: progressWidth as any, backgroundColor: colors.accentBg }]} />
          </View>
        </View>

        <View style={styles.body}>
          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="person-outline" size={48} color={colors.text} />
                </View>
              </View>
              <Text style={[styles.question, { color: colors.text }]}>Qual o seu nome?</Text>
              <Text style={[styles.hint, { color: colors.textMuted }]}>Comece sua jornada de foco e disciplina personalizando sua experiência local offline.</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Como podemos chamar você?"
                placeholderTextColor={colors.textMuted}
                maxLength={24}
                onSubmitEditing={handleNext}
                returnKeyType="next"
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={[styles.question, { color: colors.text }]}>Qual é a sua ocupação?</Text>
              <Text style={[styles.hint, { color: colors.textMuted }]}>Isso nos ajuda a entender sua rotina diária para sugerir horários e insights de foco apropriados.</Text>
              <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.grid2Col}>
                  {professions.map((prof) => {
                    const isSelected = profession === prof.id;
                    return (
                      <Pressable
                        key={prof.id}
                        onPress={() => setProfession(prof.id)}
                        style={[styles.gridItem, { borderColor: colors.border, backgroundColor: colors.surface }, isSelected && { borderColor: colors.accentBorder, backgroundColor: colors.accentLight }]}
                      >
                        <View style={[styles.gridIconBox, { backgroundColor: colors.surfaceLight }, isSelected && { backgroundColor: colors.accentLight }]}>
                          <ProfIcon icon={prof.icon} family={prof.family} color={colors.text} />
                        </View>
                        <Text style={[styles.gridItemText, { color: colors.text }]}>{prof.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={[styles.question, { color: colors.text }]}>Qual o seu objetivo?</Text>
              <Text style={[styles.hint, { color: colors.textMuted }]}>Defina o foco que guiará seu assistente. Ele ajudará a manter o compromisso.</Text>
              <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.listContainer}>
                  {goals.map((g) => {
                    const isSelected = mainGoal === g.id;
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() => setMainGoal(g.id)}
                        style={[styles.listItem, { borderColor: colors.border, backgroundColor: colors.surface }, isSelected && { borderColor: colors.accentBorder, backgroundColor: colors.accentLight }]}
                      >
                        <View style={[styles.listIconBox, { backgroundColor: colors.surfaceLight }, isSelected && { backgroundColor: colors.accentLight }]}>
                          <ProfIcon icon={g.icon} family={g.family} color={colors.text} />
                        </View>
                        <View style={styles.listTextWrap}>
                          <Text style={[styles.listItemTitle, { color: colors.text }]}>{g.label}</Text>
                          <Text style={[styles.listItemSubtitle, { color: colors.textMuted }]}>{g.subtitle}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        <Pressable
          onPress={handleNext}
          disabled={step === 1 && !name.trim()}
          style={[styles.nextBtn, { backgroundColor: colors.accentBg }, (step === 1 && !name.trim()) && [styles.nextBtnDisabled, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]]}
        >
          <Text style={[styles.nextBtnText, { color: colors.accentText }, (step === 1 && !name.trim()) && [styles.nextBtnTextDisabled, { color: colors.textMuted }]]}>
            {step === 3 ? 'Finalizar Configuração' : 'Continuar'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={step === 1 && !name.trim() ? colors.textMuted : colors.accentText} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  inner: {
    flex: 1,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  skipText: {
    fontSize: 15,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  stepContent: {
    gap: 16,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  hint: {
    fontSize: 15,
    lineHeight: 18,
  },
  input: {
    fontSize: 17,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  gridScroll: {
    maxHeight: 320,
  },
  grid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '48%',
  },

  gridIconBox: {
    padding: 8,
    borderRadius: 8,
  },

  gridItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  listIconBox: {
    padding: 8,
    borderRadius: 8,
  },

  listTextWrap: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  listItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  nextBtnDisabled: {
    borderWidth: 1,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  nextBtnTextDisabled: {},
});
