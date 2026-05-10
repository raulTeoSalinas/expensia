import { useState, useRef, useEffect, useContext, useCallback } from 'react'
import {
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    Animated,
    Easing,
    SafeAreaView,
    ActivityIndicator,
    Text as RNText,
} from 'react-native'
import Text from '@components/Text'
import GradientText from '@components/TextGradient'
import Colors from '@constants/colors'
import { es, en } from '@utils/languages'
import { ExpensiaContext } from '@context/expensiaContext'
import { useTranslation } from '@hooks/useTranslation'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { callAPI } from '../services/apiService'

// ─── Markdown renderer ───────────────────────────────────────────────────────
// Everything renders inside ONE RNText so the OS treats the whole message as
// a single selectable region — the user can drag the handles freely.

function parseInline(text) {
    const tokens = []
    const regex = /\*\*([^*]+)\*\*|`([^`]+)`/g
    let lastIndex = 0
    let m
    while ((m = regex.exec(text)) !== null) {
        if (m.index > lastIndex) tokens.push({ type: 'text', text: text.slice(lastIndex, m.index) })
        if (m[1] !== undefined) tokens.push({ type: 'bold', text: m[1] })
        else tokens.push({ type: 'code', text: m[2] })
        lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) tokens.push({ type: 'text', text: text.slice(lastIndex) })
    return tokens
}

// Returns an array of strings / nested RNText elements (no base style needed —
// they inherit from the wrapping RNText).
function renderInline(text) {
    const tokens = parseInline(text)
    return tokens.map((t, i) => {
        if (t.type === 'bold') {
            return <RNText key={i} style={{ fontFamily: 'Poppins-SemiBold' }}>{t.text}</RNText>
        }
        if (t.type === 'code') {
            return <RNText key={i} style={styles.inlineCode}>{t.text}</RNText>
        }
        return t.text
    })
}

const MarkdownMessage = ({ content, isUser }) => {
    const base = isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant
    const elements = []
    const lines = content.split('\n')
    let inCodeBlock = false

    lines.forEach((line, idx) => {
        const isLast = idx === lines.length - 1
        const nl = isLast ? '' : '\n'

        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock
            return
        }

        if (inCodeBlock) {
            elements.push(<RNText key={`c${idx}`} style={styles.codeLineText}>{line}{nl}</RNText>)
            return
        }

        // Blank line → single line break (no extra sep)
        if (line.trim() === '') {
            if (!isLast) elements.push('\n')
            return
        }

        if (line.startsWith('### ')) {
            elements.push(<RNText key={idx} style={[base, styles.mdH3]}>{renderInline(line.slice(4))}{nl}</RNText>)
        } else if (line.startsWith('## ')) {
            elements.push(<RNText key={idx} style={[base, styles.mdH2]}>{renderInline(line.slice(3))}{nl}</RNText>)
        } else if (line.startsWith('# ')) {
            elements.push(<RNText key={idx} style={[base, styles.mdH1]}>{renderInline(line.slice(2))}{nl}</RNText>)
        } else if (/^[-*•]\s/.test(line)) {
            elements.push(<RNText key={idx} style={base}>{'  • '}{renderInline(line.slice(2))}{nl}</RNText>)
        } else if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+)\.\s(.*)/)
            elements.push(<RNText key={idx} style={base}>{'  '}{match[1]}{'. '}{renderInline(match[2])}{nl}</RNText>)
        } else if (line.trim().startsWith('|') && line.trim().endsWith('|') && !/^\|[-:\s|]+\|$/.test(line.trim())) {
            const cells = line.trim().slice(1, -1).split('|').map(c => c.trim())
            elements.push(<RNText key={idx} style={[base, styles.codeLineText]}>{cells.join('  ·  ')}{nl}</RNText>)
        } else if (/^[-=_]{3,}$/.test(line.trim())) {
            elements.push(<RNText key={idx} style={[base, styles.hrText]}>{'─'.repeat(28)}{nl}</RNText>)
        } else {
            elements.push(<RNText key={idx} style={base}>{renderInline(line)}{nl}</RNText>)
        }
    })

    return <RNText style={base}>{elements}</RNText>
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function stripMarkdown(text) {
    return text
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/^#{1,3}\s+/gm, '')
        .replace(/^[-*•]\s/gm, '• ')
        .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/, '').replace(/```/, ''))
        .trim()
}

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await Clipboard.setStringAsync(stripMarkdown(text))
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn} hitSlop={8} activeOpacity={0.6}>
            <MaterialCommunityIcons
                name={copied ? 'check' : 'content-copy'}
                size={14}
                color={copied ? Colors.secondary : Colors.placeholder}
            />
        </TouchableOpacity>
    )
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user'
    return (
        <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
            {!isUser && (
                <View style={styles.avatar}>
                    <MaterialCommunityIcons name="robot" size={14} color={Colors.light} />
                </View>
            )}
            <View style={styles.bubbleColumn}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
                    <MarkdownMessage content={message.content} isUser={isUser} />
                </View>
                {!isUser && <CopyButton text={message.content} />}
            </View>
        </View>
    )
}

// ─── LoadingBubble with rotating jokes ───────────────────────────────────────

const LoadingBubble = () => {
    const msgs = useTranslation().iaTransactionsScreen.loadingMsgs

    const randomIndex = (length, exclude) => {
        if (length <= 1) return 0
        let next = Math.floor(Math.random() * length)
        while (next === exclude) next = Math.floor(Math.random() * length)
        return next
    }

    const [msgIndex, setMsgIndex] = useState(() => randomIndex(msgs.length, -1))
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(6)).current

    // Fade in on mount
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start()
    }, [])

    // Rotate text every 2.2s
    useEffect(() => {
        const id = setInterval(() => {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: -4, duration: 150, useNativeDriver: true }),
            ]).start(() => {
                setMsgIndex(i => randomIndex(msgs.length, i))
                translateY.setValue(6)
                Animated.parallel([
                    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(translateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                ]).start()
            })
        }, 2200)
        return () => clearInterval(id)
    }, [msgs.length])

    return (
        <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
            <View style={styles.avatar}>
                <MaterialCommunityIcons name="robot" size={14} color={Colors.light} />
            </View>
            <View style={[styles.bubble, styles.bubbleAssistant, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={Colors.secondary} />
                <Animated.View style={[styles.loadingMsgWrap, { opacity, transform: [{ translateY }] }]}>
                    <RNText style={styles.loadingMsg}>{msgs[msgIndex]}</RNText>
                </Animated.View>
            </View>
        </View>
    )
}

// ─── ChatScreen ───────────────────────────────────────────────────────────────

const ChatScreen = () => {
    const { user } = useContext(ExpensiaContext)
    const strings = user?.language === 'en' ? en : es
    const t = strings.chatScreen

    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [listKey, setListKey] = useState(0)

    const flatListRef = useRef(null)

    const scrollToBottom = useCallback((animated = true) => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated }), 50)
    }, [])

    useEffect(() => {
        if (messages.length > 0 || isLoading) scrollToBottom()
    }, [messages.length, isLoading])

    useEffect(() => {
        const sub = Keyboard.addListener('keyboardDidShow', () => scrollToBottom(false))
        return () => sub.remove()
    }, [scrollToBottom])

    const startNewChat = () => {
        setMessages([])
        setError(null)
        setInputText('')
        setListKey(k => k + 1)
    }

    const sendMessage = async () => {
        const content = inputText.trim()
        if (!content || isLoading) return

        const userMsg = { id: Date.now().toString(), role: 'user', content }
        const nextMessages = [...messages, userMsg]
        setMessages(nextMessages)
        setInputText('')
        setIsLoading(true)
        setError(null)

        const apiMessages = nextMessages
            .slice(-30)
            .map(m => ({ role: m.role, content: m.content }))

        const { data, errorType } = await callAPI('/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages: apiMessages,
                language: user?.language ?? 'es',
                userName: user?.name ?? 'User',
                clientDate: new Date().toISOString().split('T')[0],
            }),
        })

        setIsLoading(false)

        if (errorType || !data?.reply) {
            setError(t.errorGeneric)
            return
        }

        setMessages(prev => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply },
        ])
    }

    const renderItem = useCallback(({ item }) => <MessageBubble message={item} />, [])
    const keyExtractor = useCallback(item => item.id, [])

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={startNewChat} hitSlop={12} style={styles.headerBtn}>
                    <MaterialCommunityIcons name="refresh" size={22} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.headerBrand}>
                    <Text weight="bold" style={styles.headerTitle}>Expens</Text>
                    <View style={styles.headerIABadge}>
                        <GradientText style={styles.headerTitle} weight="bold">IA</GradientText>
                    </View>
                    <Text weight="bold" style={styles.headerTitle}>  Chat</Text>
                </View>

                <View style={styles.headerBtn} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {/* Message list */}
                <FlatList
                    key={listKey}
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={[
                        styles.listContent,
                        messages.length === 0 && styles.listContentEmpty,
                    ]}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="chat-question-outline" size={52} color={Colors.secondary} style={{ opacity: 0.4 }} />
                            <Text weight="bold" style={styles.emptyTitle}>{t.emptyTitle}</Text>
                            <Text style={styles.emptySubtitle}>{t.emptySubtitle}</Text>
                            <View style={styles.suggestionsWrap}>
                                {t.suggestions.map((s, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.chip}
                                        onPress={() => setInputText(s)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.chipText}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    }
                    ListFooterComponent={isLoading ? <LoadingBubble /> : null}
                />

                {/* Error banner */}
                {error && (
                    <View style={styles.errorRow}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => setError(null)} hitSlop={8}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Input area */}
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder={t.inputPlaceholder}
                        placeholderTextColor={Colors.placeholder}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        returnKeyType="default"
                        blurOnSubmit={false}
                        autoCorrect={true}
                        autoCapitalize="sentences"
                        spellCheck={true}
                        keyboardType="default"
                        onFocus={() => scrollToBottom(true)}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="send" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default ChatScreen

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    flex: {
        flex: 1,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: Colors.light,
        borderBottomWidth: 1,
        borderBottomColor: Colors.sheetBorder,
    },
    headerBtn: {
        width: 32,
        alignItems: 'center',
    },
    headerBrand: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        color: Colors.primary,
    },
    headerIABadge: {
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.secondary,
        marginLeft: 2,
    },
    // Messages list
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    listContentEmpty: {
        flex: 1,
    },
    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    emptyTitle: {
        color: Colors.primary,
        fontSize: 20,
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: Colors.primary,
        opacity: 0.5,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    suggestionsWrap: {
        marginTop: 28,
        gap: 10,
        width: '100%',
    },
    chip: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.secondary + '44',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    chipText: {
        color: Colors.primary,
        fontSize: 14,
    },
    // Bubbles
    bubbleRow: {
        flexDirection: 'row',
        marginBottom: 10,
        maxWidth: '85%',
    },
    bubbleRowUser: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    bubbleRowAssistant: {
        alignSelf: 'flex-start',
    },
    bubbleColumn: {
        flexShrink: 1,
    },
    copyBtn: {
        alignSelf: 'flex-start',
        marginTop: 4,
        marginLeft: 4,
        padding: 4,
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginTop: 2,
        flexShrink: 0,
    },
    bubble: {
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    bubbleUser: {
        backgroundColor: Colors.secondary,
        borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 4,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    bubbleTextUser: {
        fontSize: 15,
        lineHeight: 21,
        color: Colors.white,
        fontFamily: 'Poppins-Light',
    },
    bubbleTextAssistant: {
        fontSize: 15,
        lineHeight: 21,
        color: Colors.primary,
        fontFamily: 'Poppins-Light',
    },
    loadingBubble: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    loadingMsgWrap: {
        flexShrink: 1,
    },
    loadingMsg: {
        fontSize: 13,
        color: Colors.placeholder,
        fontFamily: 'Poppins-Light',
        fontStyle: 'italic',
    },
    // Markdown styles
    mdH1: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    mdH2: {
        fontSize: 17,
        fontFamily: 'Poppins-SemiBold',
    },
    mdH3: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
    },
    inlineCode: {
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        backgroundColor: 'rgba(0,0,0,0.07)',
        fontSize: 13,
    },
    codeLineText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        backgroundColor: 'rgba(0,0,0,0.05)',
        fontSize: 13,
        lineHeight: 18,
    },
    hrText: {
        color: 'rgba(0,0,0,0.2)',
        letterSpacing: 1,
    },
    // Error
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: Colors.error,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    errorText: {
        color: Colors.white,
        fontSize: 13,
        flex: 1,
        marginRight: 8,
        fontFamily: 'Poppins-Light',
    },
    // Input
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.sheetBorder,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.light,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        color: Colors.primary,
        maxHeight: 110,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    sendBtnDisabled: {
        backgroundColor: Colors.secondary + '55',
    },
})
