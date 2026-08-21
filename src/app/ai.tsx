import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LoadingView } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { registerStrings, useLang } from '@/i18n';
import { askQalbunAI } from '@/lib/api';
import { getJSON, setJSON } from '@/lib/storage';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeScheme } from '@/theme';

const HISTORY_KEY = 'muslimhub.ai.history';

registerStrings('ai', {
  title: 'Tanya Qalbun AI',
  subtitle: 'Tanya seputar Islam',
  inputPlaceholder: 'Tulis pertanyaan Anda…',
  thinking: 'Mengetik…',
  error: 'Gagal menjawab',
  greeting: 'Halo, saya Qalbun AI',
  emptyText: 'Tanyakan apa saja seputar Islam — fiqih, akhlak, kisah nabi, hingga tata cara ibadah.',
}, {
  title: 'Tanya Qalbun AI',
  subtitle: 'Ask about Islam',
  inputPlaceholder: 'Type your question…',
  thinking: 'Thinking…',
  error: 'Failed to answer',
  greeting: 'Hi, I am Qalbun AI',
  emptyText: 'Ask anything about Islam — fiqh, manners, prophet stories, and acts of worship.',
});

const TIPS: Record<'id' | 'en', string[]> = {
  id: [
    'Kisah Nabi Muhammad SAW',
    'Tata cara shalat',
    'Keutamaan sedekah',
    "Adab membaca Al Qur'an",
    'Doa sebelum tidur',
  ],
  en: [
    'Story of Prophet Muhammad SAW',
    'How to perform prayer',
    'Virtues of giving charity',
    "Etiquette of reading the Qur'an",
    'Prayer before sleeping',
  ],
};

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  error?: boolean;
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function QalbunAIScreen() {
  const { t, lang } = useLang();
  const { colors, gradients, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);
  const tips = TIPS[lang];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getJSON<ChatMessage[]>(HISTORY_KEY)
      .then((stored) => {
        if (stored && stored.length > 0) setMessages(stored);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      setJSON(HISTORY_KEY, messages).catch(() => undefined);
    }
  }, [messages, hydrated]);

  const display = useMemo(() => [...messages].reverse(), [messages]);

  const ask = async (question: string, includeUserBubble: boolean) => {
    setLoading(true);
    if (includeUserBubble) {
      setMessages((prev) => [...prev, { id: createId('user'), role: 'user', content: question }]);
    }
    try {
      const answer = await askQalbunAI(question);
      setMessages((prev) => [...prev, { id: createId('ai'), role: 'ai', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createId('err'),
          role: 'ai',
          content: t('ai.error'),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => {
    const question = input.trim();
    if (!question || loading) return;
    setInput('');
    ask(question, true).catch(() => undefined);
  };

  const retry = (errorId: string) => {
    if (loading) return;
    const index = messages.findIndex((m) => m.id === errorId);
    if (index <= 0) return;
    const question = messages[index - 1].content;
    setMessages(messages.slice(0, index));
    ask(question, false).catch(() => undefined);
  };

  const renderBubble = ({ item }: { item: ChatMessage }) => {
    if (item.role === 'user') {
      return (
        <Animated.View entering={FadeIn.duration(250)} style={styles.userBubbleWrap}>
          <LinearGradient
            colors={[...gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.userBubble]}
          >
            <Text style={styles.userText}>{item.content}</Text>
          </LinearGradient>
        </Animated.View>
      );
    }
    if (item.error) {
      return (
        <Animated.View entering={FadeIn.duration(250)} style={[styles.bubble, styles.errorBubble]}>
          <Ionicons name="warning" size={16} color={colors.danger} />
          <Text style={styles.errorText}>{item.content}</Text>
          <PressableScale onPress={() => retry(item.id)} style={styles.retryBtn}>
            <Ionicons name="refresh" size={14} color={colors.danger} />
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </PressableScale>
        </Animated.View>
      );
    }
    const paragraphs = item.content
      .split(/\n+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    return (
      <Animated.View entering={FadeIn.duration(250)} style={[styles.bubble, styles.aiBubble]}>
        {paragraphs.map((paragraph, index) => (
          <Text key={index} style={styles.aiText}>
            {paragraph}
          </Text>
        ))}
      </Animated.View>
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <PageHeader title={t('ai.title')} subtitle={t('ai.subtitle')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsContent}
          style={styles.tipsRow}
        >
          {tips.map((tip) => (
            <PressableScale key={tip} onPress={() => setInput(tip)} style={styles.tipChip}>
              <Ionicons name="flash" size={13} color={colors.gold} />
              <Text style={styles.tipText} numberOfLines={1}>
                {tip}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient
              colors={[...gradients.emerald]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyIcon}
            >
              <Ionicons name="chatbubbles" size={32} color={colors.gold} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>{t('ai.greeting')}</Text>
            <Text style={styles.emptyText}>{t('ai.emptyText')}</Text>
          </View>
        ) : (
          <FlatList
            data={display}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={renderBubble}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              loading ? (
                <View style={[styles.bubble, styles.loadingBubble]}>
                  <View style={styles.loadingInner}>
                    <LoadingView label={t('ai.thinking')} />
                  </View>
                </View>
              ) : null
            }
          />
        )}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={t('ai.inputPlaceholder')}
              placeholderTextColor={colors.textFaint}
              multiline
              maxLength={500}
              editable={!loading}
              onSubmitEditing={send}
            />
          </View>
          <PressableScale
            onPress={send}
            disabled={!input.trim() || loading}
            style={styles.sendWrap}
          >
            <LinearGradient
              colors={[...gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendDisabled]}
            >
              <Ionicons name="arrow-up" size={20} color={colors.bg} />
            </LinearGradient>
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (c: ThemeColors, scheme: ThemeScheme) =>
  StyleSheet.create({
  flex: {
    flex: 1,
  },
  tipsRow: {
    flexGrow: 0,
    marginBottom: spacing.xs,
  },
  tipsContent: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  tipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  tipText: {
    fontFamily: font.semibold,
    fontSize: 12.5,
    color: c.textMuted,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontFamily: font.extrabold,
    fontSize: 20,
    color: c.text,
  },
  emptyText: {
    fontFamily: font.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: c.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  userBubbleWrap: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  userBubble: {
    borderTopRightRadius: 6,
  },
  userText: {
    fontFamily: font.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: scheme === 'dark' ? c.bgDeep : c.white,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderTopLeftRadius: 6,
    gap: spacing.sm,
  },
  aiText: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 21,
    color: c.text,
  },
  errorBubble: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(248, 113, 113, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    borderTopLeftRadius: 6,
    gap: spacing.sm,
  },
  errorText: {
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 19,
    color: c.danger,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  retryText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: c.danger,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderTopLeftRadius: 6,
  },
  loadingInner: {
    marginVertical: -30,
    minWidth: 190,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  input: {
    fontFamily: font.regular,
    fontSize: 14.5,
    lineHeight: 20,
    color: c.text,
    maxHeight: 110,
    padding: 0,
  },
  sendWrap: {
    borderRadius: 23,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.45,
  },
});
