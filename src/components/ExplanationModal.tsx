import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';

interface ExplanationModalProps {
  onClose: () => void;
}

export default function ExplanationModal({ onClose }: ExplanationModalProps) {
  const colors = useThemeColors();
  const $ = useT();

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
        <View style={[styles.handle, { backgroundColor: colors.surfaceLight }]} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color={colors.accentText} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Como Funciona o FocusBell?</Text>
          </View>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            O <Text style={{ color: colors.text, fontWeight: '700' }}>FocusBell</Text> é um assistente de produtividade profunda que ajuda você a reestabelecer o controle da sua mente através de alarmes de foco e sessões guiadas.
          </Text>
          <View style={{ gap: 16, marginTop: 16 }}>
            <FeatureRow
              icon={<Ionicons name="volume-medium-outline" size={16} color="#fb923c" />}
              title="Alerta Sonoro Inteligente"
              desc="Quando uma sessão de foco inicia, o FocusBell toca um alarme sintetizado e contínuo que ajuda você a acordar do estado de distração e entrar no flow."
              colors={colors}
            />
            <FeatureRow
              icon={<Ionicons name="options-outline" size={16} color={colors.accentText} />}
              title="Interação Perfeita e Botões"
              desc="Todos os botões possuem feedback sonoro instantâneo. Você pode clicar em Iniciar Sessão para forçar um alarme imediato ou aguardar o horário planejado."
              colors={colors}
            />
            <FeatureRow
              icon={<Ionicons name="shield-checkmark-outline" size={16} color="#34d399" />}
              title="Auto-Reflexão & Diário"
              desc="Ao concluir uma tarefa, insira uma reflexão pessoal. Suas notas são consolidadas no diário de histórico offline para construir disciplina contínua."
              colors={colors}
            />
            <FeatureRow
              icon={<Ionicons name="heart-outline" size={16} color="#a78bfa" />}
              title="Temas de Alta Fidelidade"
              desc="Personalize sua identidade visual! Você pode alternar entre o Azul Clássico de alta produtividade ou o Branco Minimalista premium nas configurações de Perfil."
              colors={colors}
            />
          </View>
          <Text style={[styles.footerQuote, { color: colors.textMuted }]}>"Sua atenção é seu recurso mais valioso."</Text>
        </ScrollView>
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable onPress={onClose} style={[styles.doneBtn, { backgroundColor: colors.accentBg }]}>
            <Ionicons name="checkmark" size={16} color={colors.accentText} />
            <Text style={[styles.doneBtnText, { color: colors.accentText }]}>Entendido, Vamos Focar!</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FeatureRow({ icon, title, desc, colors }: { icon: React.ReactNode; title: string; desc: string; colors: any }) {
  return (
    <View style={[styles.featureRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textMuted }]}>{desc}</Text>
      </View>
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
  body: { padding: 24, flexGrow: 0 },
  introText: { fontSize: 15, fontWeight: '500', lineHeight: 18 },
  featureRow: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 12, padding: 12 },
  featureIcon: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(249,115,22,0.1)' },
  featureTitle: { fontSize: 17, fontWeight: '600' },
  featureDesc: { fontSize: 15, lineHeight: 18 },
  footerQuote: { fontSize: 15, fontStyle: 'italic', textAlign: 'center', marginTop: 20, paddingBottom: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
  doneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  doneBtnText: { fontSize: 15, fontWeight: '700' },
});
