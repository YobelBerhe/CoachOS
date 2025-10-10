import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Image as ImageIcon,
  Smile,
  Paperclip,
  Mic,
  Check,
  CheckCheck,
  Circle,
  Plus,
  Edit,
  Archive,
  Trash2,
  UserPlus,
  Settings,
  Info,
  BellOff,
  Block,
  Flag,
  Camera,
  File,
  MapPin,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  is_online: boolean;
  last_seen: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'workout' | 'meal';
  timestamp: string;
  is_read: boolean;
  reactions?: { emoji: string; users: string[] }[];
}

interface Conversation {
  id: string;
  user: User;
  last_message: Message;
  unread_count: number;
  is_pinned: boolean;
  is_archived: boolean;
}

// Sample data
const SAMPLE_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: 'sarahfitness',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    is_online: true,
    last_seen: 'Active now'
  },
  {
    id: '2',
    name: 'Mike Chen',
    username: 'mikesgains',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    is_online: false,
    last_seen: 'Active 5m ago'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    username: 'emilyeats',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    is_online: true,
    last_seen: 'Active now'
  }
];

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    user: SAMPLE_USERS[0],
    last_message: {
      id: '1',
      sender_id: '1',
      content: 'Hey! Great workout today! 💪',
      type: 'text',
      timestamp: '2m ago',
      is_read: false
    },
    unread_count: 3,
    is_pinned: true,
    is_archived: false
  },
  {
    id: '2',
    user: SAMPLE_USERS[1],
    last_message: {
      id: '2',
      sender_id: 'me',
      content: 'Thanks for the meal plan!',
      type: 'text',
      timestamp: '1h ago',
      is_read: true
    },
    unread_count: 0,
    is_pinned: false,
    is_archived: false
  },
  {
    id: '3',
    user: SAMPLE_USERS[2],
    last_message: {
      id: '3',
      sender_id: '3',
      content: 'Can you share that recipe?',
      type: 'text',
      timestamp: '3h ago',
      is_read: false
    },
    unread_count: 1,
    is_pinned: false,
    is_archived: false
  }
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    sender_id: '1',
    content: 'Hey! How are you?',
    type: 'text',
    timestamp: '10:30 AM',
    is_read: true
  },
  {
    id: '2',
    sender_id: 'me',
    content: "I'm great! Just finished my workout 💪",
    type: 'text',
    timestamp: '10:32 AM',
    is_read: true
  },
  {
    id: '3',
    sender_id: '1',
    content: 'Awesome! What did you do today?',
    type: 'text',
    timestamp: '10:33 AM',
    is_read: true
  },
  {
    id: '4',
    sender_id: 'me',
    content: 'Squats, deadlifts, and some cardio. Feeling great!',
    type: 'text',
    timestamp: '10:35 AM',
    is_read: true,
    reactions: [
      { emoji: '💪', users: ['1'] },
      { emoji: '🔥', users: ['1'] }
    ]
  },
  {
    id: '5',
    sender_id: '1',
    content: 'Nice! Keep it up! Want to hit the gym together tomorrow?',
    type: 'text',
    timestamp: '10:36 AM',
    is_read: true
  },
  {
    id: '6',
    sender_id: 'me',
    content: "Absolutely! What time works for you?",
    type: 'text',
    timestamp: '10:38 AM',
    is_read: true
  },
  {
    id: '7',
    sender_id: '1',
    content: 'How about 7 AM? We can do a full body workout 🏋️',
    type: 'text',
    timestamp: '10:40 AM',
    is_read: false
  }
];

export default function Messages() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    init();
  }, [username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    // If username provided, open that conversation
    if (username) {
      const conversation = conversations.find(c => c.user.username === username);
      if (conversation) {
        setActiveConversation(conversation);
        markAsRead(conversation.id);
      }
    }

    // In production, load from Supabase with real-time subscriptions
    // const channel = supabase
    //   .channel('messages')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
    //   .subscribe();
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function markAsRead(conversationId: string) {
    setConversations(conversations.map(c =>
      c.id === conversationId ? { ...c, unread_count: 0 } : c
    ));
  }

  function selectConversation(conversation: Conversation) {
    setActiveConversation(conversation);
    markAsRead(conversation.id);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      sender_id: 'me',
      content: newMessage,
      type: 'text',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      is_read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update conversation
    setConversations(conversations.map(c =>
      c.id === activeConversation.id
        ? { ...c, last_message: message }
        : c
    ));

    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        simulateReply();
      }, 2000);
    }, 500);
  }

  function simulateReply() {
    const replies = [
      "That's awesome! 🎉",
      "Keep up the great work! 💪",
      "Sounds good to me!",
      "Let's do it! 🔥",
      "I'm in! When should we start?"
    ];

    const reply: Message = {
      id: Date.now().toString(),
      sender_id: activeConversation?.user.id || '1',
      content: replies[Math.floor(Math.random() * replies.length)],
      type: 'text',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      is_read: false
    };

    setMessages(prev => [...prev, reply]);
  }

  function addReaction(messageId: string, emoji: string) {
    setMessages(messages.map(m => {
      if (m.id === messageId) {
        const reactions = m.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          // Toggle reaction
          if (existingReaction.users.includes('me')) {
            existingReaction.users = existingReaction.users.filter(u => u !== 'me');
            if (existingReaction.users.length === 0) {
              return { ...m, reactions: reactions.filter(r => r.emoji !== emoji) };
            }
          } else {
            existingReaction.users.push('me');
          }
          return { ...m, reactions };
        } else {
          // Add new reaction
          return { ...m, reactions: [...reactions, { emoji, users: ['me'] }] };
        }
      }
      return m;
    }));
    setSelectedMessage(null);
  }

  function deleteMessage(messageId: string) {
    setMessages(messages.filter(m => m.id !== messageId));
    setSelectedMessage(null);
    toast({ title: "Message deleted" });
  }

  function pinConversation(conversationId: string) {
    setConversations(conversations.map(c =>
      c.id === conversationId ? { ...c, is_pinned: !c.is_pinned } : c
    ).sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    }));
  }

  function archiveConversation(conversationId: string) {
    setConversations(conversations.map(c =>
      c.id === conversationId ? { ...c, is_archived: true } : c
    ));
    toast({ title: "Conversation archived" });
  }

  function deleteConversation(conversationId: string) {
    setConversations(conversations.filter(c => c.id !== conversationId));
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
    }
    toast({ title: "Conversation deleted" });
  }

  const filteredConversations = conversations.filter(c =>
    !c.is_archived && (
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_message.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={activeConversation?.user.avatar} />
          <AvatarFallback>{activeConversation?.user.name[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          onLongPress={() => setSelectedMessage(message.id)}
          onClick={() => setSelectedMessage(message.id)}
          className={`relative px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-secondary'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="absolute -bottom-3 left-2 flex gap-1">
              {message.reactions.map((reaction, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-background border-2 border-border rounded-full px-2 py-0.5 text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-muted-foreground">{reaction.users.length}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground`}>
          <span>{message.timestamp}</span>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="w-3 h-3 text-blue-500" />
            ) : (
              <Check className="w-3 h-3" />
            )
          )}
        </div>

        {/* Quick reactions popup */}
        <AnimatePresence>
          {selectedMessage === message.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-10 mt-2 p-2 bg-background border rounded-lg shadow-xl flex gap-2"
            >
              {['❤️', '👍', '😂', '😮', '😢', '😡'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addReaction(message.id, emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
              <div className="border-l mx-1" />
              <button
                onClick={() => deleteMessage(message.id)}
                className="text-destructive hover:scale-110 transition-transform p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="hover:scale-110 transition-transform p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            toast({ title: "File selected! 📎" });
          }
        }}
      />

      {/* Sidebar - Conversations List */}
      <div className="w-full md:w-96 border-r flex flex-col bg-background/95 backdrop-blur">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/social')}
                className="rounded-full md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewChat(true)}
                className="rounded-full"
              >
                <Edit className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Archive className="w-4 h-4 mr-2" />
                    Archived
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map(conversation => (
              <motion.div
                key={conversation.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => selectConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  activeConversation?.id === conversation.id
                    ? 'bg-primary/10'
                    : 'hover:bg-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                    {conversation.user.is_online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{conversation.user.name}</p>
                        {conversation.is_pinned && (
                          <Circle className="w-3 h-3 fill-primary text-primary" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {conversation.last_message.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message.sender_id === 'me' && (
                          <span className="mr-1">
                            {conversation.last_message.is_read ? (
                              <CheckCheck className="w-3 h-3 inline text-blue-500" />
                            ) : (
                              <Check className="w-3 h-3 inline" />
                            )}
                          </span>
                        )}
                        {conversation.last_message.content}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge className="ml-2 bg-blue-500 text-white">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => pinConversation(conversation.id)}>
                        <Circle className="w-4 h-4 mr-2" />
                        {conversation.is_pinned ? 'Unpin' : 'Pin'} chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archiveConversation(conversation.id)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteConversation(conversation.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}

            {filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No conversations found</p>
                <Button onClick={() => setShowNewChat(true)} className="mt-4">
                  Start a conversation
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/profile/${activeConversation.user.username}`)}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveConversation(null);
                }}
                className="rounded-full md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={activeConversation.user.avatar} />
                  <AvatarFallback>{activeConversation.user.name[0]}</AvatarFallback>
                </Avatar>
                {activeConversation.user.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              <div>
                <p className="font-semibold">{activeConversation.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {isTyping ? 'typing...' : activeConversation.user.last_seen}
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Video className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUserInfo(true)}
                className="rounded-full"
              >
                <Info className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gradient-to-br from-background via-purple-500/5 to-background">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === 'me'}
                />
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activeConversation.user.avatar} />
                    <AvatarFallback>{activeConversation.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary px-4 py-2 rounded-2xl">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full flex-shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="pr-12"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
                >
                  <Smile className="w-5 h-5" />
                </Button>
              </div>

              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-br from-background via-purple-500/5 to-background">
          <div className="text-center">
            <MessageCircle className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
            <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
            <p className="text-muted-foreground mb-6">
              Send private messages to friends
            </p>
            <Button onClick={() => setShowNewChat(true)} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              New Message
            </Button>
          </div>
        </div>
      )}

      {/* New Chat Dialog */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>Search for someone to start a conversation</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>

            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {SAMPLE_USERS.map(user => (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      const newConv: Conversation = {
                        id: Date.now().toString(),
                        user,
                        last_message: {
                          id: '0',
                          sender_id: 'me',
                          content: '',
                          type: 'text',
                          timestamp: 'Now',
                          is_read: true
                        },
                        unread_count: 0,
                        is_pinned: false,
                        is_archived: false
                      };
                      setConversations([newConv, ...conversations]);
                      setActiveConversation(newConv);
                      setMessages([]);
                      setShowNewChat(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer"
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Info Dialog */}
      <Dialog open={showUserInfo} onOpenChange={setShowUserInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chat Info</DialogTitle>
          </DialogHeader>

          {activeConversation && (
            <div className="space-y-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={activeConversation.user.avatar} />
                  <AvatarFallback>{activeConversation.user.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{activeConversation.user.name}</h3>
                <p className="text-muted-foreground">@{activeConversation.user.username}</p>
                <Button
                  onClick={() => navigate(`/profile/${activeConversation.user.username}`)}
                  variant="outline"
                  className="mt-4"
                >
                  View Profile
                </Button>
              </div>

              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <BellOff className="w-4 h-4 mr-2" />
                  Mute notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive chat
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive">
                  <Block className="w-4 h-4 mr-2" />
                  Block user
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
