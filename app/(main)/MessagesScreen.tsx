import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, MessageCircle, BadgeCheck, Send, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInRight, FadeInLeft } from 'react-native-reanimated';

type Conversation = {
  id: string;
  sellerName: string;
  sellerId: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isCelebrity: boolean;
  item: string;
};

type Message = { id: string; text: string; fromSeller: boolean; time: string };

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    sellerName: 'Anne Curtis',
    sellerId: '1',
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    lastMessage: 'Hi! The ASAP stage gown will be authenticated and shipped with the certificate. 💙',
    time: '2m ago',
    unread: 2,
    isCelebrity: true,
    item: 'ASAP Stage Gown',
  },
  {
    id: '2',
    sellerName: 'Kathryn Bernardo',
    sellerId: '3',
    avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
    lastMessage: 'I can arrange express delivery for you, mare! The handbag is from my premiere. 💕',
    time: '1h ago',
    unread: 0,
    isCelebrity: true,
    item: 'Luxury Handbag',
  },
  {
    id: '3',
    sellerName: 'Bretman Rock',
    sellerId: '6',
    avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
    lastMessage: 'Sis, the MAC palette comes with my personal note and certificate! 💄',
    time: '3h ago',
    unread: 1,
    isCelebrity: true,
    item: 'Signed MAC Collab Palette',
  },
  {
    id: '4',
    sellerName: 'Donnalyn Bartolome',
    sellerId: '8',
    avatar: 'https://randomuser.me/api/portraits/women/38.jpg',
    lastMessage: 'Your bid was accepted! Magpapadala na ako ng confirmation. 🎵',
    time: 'Yesterday',
    unread: 0,
    isCelebrity: true,
    item: 'Signed Debut Album',
  },
  {
    id: '5',
    sellerName: 'Ivana Alawi',
    sellerId: '5',
    avatar: 'https://randomuser.me/api/portraits/women/50.jpg',
    lastMessage: 'Sure! I can hold the diamond ring for 24 hours for you. 💖',
    time: '2d ago',
    unread: 0,
    isCelebrity: true,
    item: 'Diamond Ring',
  },
];

const MOCK_REPLIES: Record<string, string[]> = {
  '1': ['Of course! The authentication certificate will be included. 💙', 'Shipping usually takes 3–5 days.', 'Let me know if you have any questions!'],
  '2': ['The handbag is in perfect condition, mare! 💕', 'I can ship it out by tomorrow.', 'Just let me know your address!'],
  '3': ['Sis, I personally signed every palette! 💄', 'It comes with a holographic authenticity sticker.', 'So excited for you to have it!'],
  '4': ['Yes! Your bid was the highest, congratulations! 🎉', 'I will ship it within 2 business days.', "It's one of my most special pieces!"],
  '5': ['I can hold it for 24 hours for you! 💖', 'The appraisal certificate is included.', 'This ring is very special to me.'],
};

function buildInitialMessages(conv: Conversation): Message[] {
  return [
    { id: 'm0', text: `Hi! I'm interested in your "${conv.item}".`, fromSeller: false, time: '10:00 AM' },
    { id: 'm1', text: conv.lastMessage, fromSeller: true, time: conv.time },
  ];
}

export default function MessagesScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const replyIdxRef = useRef(0);

  const filtered = CONVERSATIONS.filter((c) =>
    c.sellerName.toLowerCase().includes(searchText.toLowerCase()) ||
    c.item.toLowerCase().includes(searchText.toLowerCase())
  );

  function openConversation(conv: Conversation) {
    setActiveConv(conv);
    setMessages(buildInitialMessages(conv));
    replyIdxRef.current = 0;
  }

  function sendMessage() {
    if (!inputText.trim() || !activeConv) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = { id: `m${Date.now()}`, text: inputText.trim(), fromSeller: false, time: now };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate seller reply after delay
    const replies = MOCK_REPLIES[activeConv.id] || ['Thanks for reaching out! 😊'];
    const replyText = replies[replyIdxRef.current % replies.length];
    replyIdxRef.current += 1;
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `m${Date.now()}r`, text: replyText, fromSeller: true, time: now },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 900);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  // ── Chat view ──
  if (activeConv) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#F5F8FA' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
          <View style={styles.chatHeader}>
            <Pressable onPress={() => setActiveConv(null)} style={styles.backBtn}>
              <ArrowLeft size={22} color="#fff" />
            </Pressable>
            <Image source={{ uri: activeConv.avatar }} style={styles.chatAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.chatName}>{activeConv.sellerName}</Text>
              <Text style={styles.chatItem} numberOfLines={1}>{activeConv.item}</Text>
            </View>
          </View>
        </SafeAreaView>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {messages.map((msg, i) => (
            <Animated.View
              key={msg.id}
              entering={i < 2 ? FadeInDown.delay(i * 60).duration(300) : FadeInDown.duration(250)}
              style={[
                styles.bubbleWrap,
                msg.fromSeller ? styles.bubbleWrapLeft : styles.bubbleWrapRight,
              ]}>
              {msg.fromSeller && (
                <Image source={{ uri: activeConv.avatar }} style={styles.bubbleAvatar} />
              )}
              <View style={[styles.bubble, msg.fromSeller ? styles.bubbleSeller : styles.bubbleMe]}>
                <Text style={[styles.bubbleText, msg.fromSeller ? styles.bubbleTextSeller : styles.bubbleTextMe]}>
                  {msg.text}
                </Text>
                <Text style={[styles.bubbleTime, { color: msg.fromSeller ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.6)' }]}>
                  {msg.time}
                </Text>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            placeholderTextColor="#B0BAC4"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline
          />
          <Pressable
            onPress={sendMessage}
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.4 }]}>
            <Send size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Conversation list ──
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.searchContainer}>
          <Search size={15} color="#999" />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor="#BCBCBC"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Start browsing and message sellers about items you love
            </Text>
          </View>
        ) : (
          filtered.map((conv, index) => (
            <Animated.View key={conv.id} entering={FadeInDown.delay(index * 60).duration(400)}>
              <Pressable
                onPress={() => openConversation(conv)}
                style={[styles.convItem, conv.unread > 0 && styles.convItemUnread]}>
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: conv.avatar }} style={styles.avatar} />
                  {conv.isCelebrity && (
                    <View style={styles.verifiedBadge}>
                      <BadgeCheck size={12} color="#4289AB" fill="#fff" />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.convHeader}>
                    <Text style={styles.sellerName}>{conv.sellerName}</Text>
                    <Text style={styles.time}>{conv.time}</Text>
                  </View>
                  <Text style={styles.itemLabel} numberOfLines={1}>{conv.item}</Text>
                  <Text
                    style={[styles.lastMessage, conv.unread > 0 && styles.lastMessageUnread]}
                    numberOfLines={1}>
                    {conv.lastMessage}
                  </Text>
                </View>
                {conv.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{conv.unread}</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#333',
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  convItemUnread: { backgroundColor: '#F0F7FF' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sellerName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A1A2E' },
  time: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#999' },
  itemLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#4289AB', marginBottom: 2 },
  lastMessage: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#999' },
  lastMessageUnread: { fontFamily: 'Poppins_600SemiBold', color: '#333' },
  unreadBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#4289AB', alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  unreadText: { fontFamily: 'Poppins_700Bold', fontSize: 10, color: '#fff' },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#333', marginTop: 16 },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#999',
    textAlign: 'center', lineHeight: 20, marginTop: 8,
  },

  // Chat view
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  chatAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  chatName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#fff' },
  chatItem: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bubbleWrapLeft: { alignSelf: 'flex-start', maxWidth: '80%' },
  bubbleWrapRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse', maxWidth: '80%' },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    maxWidth: '100%',
  },
  bubbleSeller: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: '#4289AB',
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 19 },
  bubbleTextSeller: { color: '#1A1A2E' },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 4, textAlign: 'right' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#1A1A2E',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E4ECF1',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4289AB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
