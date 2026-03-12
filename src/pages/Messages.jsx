import { Search, Edit, MoreVertical, Image as ImageIcon, Paperclip, Send, Phone, Video, Loader2, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getConversations, getConversation, sendMessage } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Messages() {
    const navigate = useNavigate()
    const [conversations, setConversations] = useState([])
    const [activeConv, setActiveConv] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [messageText, setMessageText] = useState('')
    const [sending, setSending] = useState(false)
    const [currentUserId, setCurrentUserId] = useState(null)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) { navigate('/login'); return }

                const { data: { user } } = await supabase.auth.getUser()
                setCurrentUserId(user?.id)

                const data = await getConversations()
                const convList = data.conversations || data || []
                setConversations(convList)

                if (convList.length > 0) {
                    setActiveConv(convList[0])
                    try {
                        const convData = await getConversation(convList[0].id)
                        setMessages(convData.messages || [])
                    } catch (e) {
                        setMessages(convList[0].messages || [])
                    }
                }
            } catch (err) {
                console.error('messages error:', err)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [navigate])
    useEffect(() => {
        if (!currentUserId) return

        const channel = supabase
            .channel('messages-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                const newMsg = payload.new

                // if it's relevant to me
                if (newMsg.sender_id === currentUserId || newMsg.receiver_id === currentUserId) {
                    
                    // Update active conversation feed
                    if (activeConv && (newMsg.sender_id === activeConv.user?.id || newMsg.receiver_id === activeConv.user?.id)) {
                        try {
                            const { data: profile } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', newMsg.sender_id).single()
                            const formattedMsg = {
                                id: newMsg.id,
                                text: newMsg.content,
                                time: new Date(newMsg.created_at).toLocaleTimeString(),
                                sender: profile ? { id: profile.id, name: profile.full_name, avatar: profile.avatar_url } : { id: newMsg.sender_id, name: 'Unknown', avatar: '/default-avatar.png' }
                            }
                            setMessages(prev => {
                                if (prev.some(m => m.id === formattedMsg.id)) return prev
                                return [...prev, formattedMsg]
                            })
                        } catch(e) {}
                    }

                    // Also refresh conversation list to re-order and update last active
                    const data = await getConversations()
                    setConversations(data || [])
                }
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [currentUserId, activeConv])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const selectConversation = async (conv) => {
        setActiveConv(conv)
        try {
            const data = await getConversation(conv.id)
            setMessages(data.messages || [])
        } catch (e) {
            setMessages(conv.messages || [])
        }
    }

    const handleSend = async () => {
        if (!messageText.trim() || sending || !activeConv) return
        setSending(true)
        try {
            const data = await sendMessage({
                conversation_id: activeConv.id,
                recipient_id: activeConv.user?.id,
                text: messageText
            })
            if (data.message) {
                setMessages(prev => [...prev, data.message])
            } else {
                setMessages(prev => [...prev, { id: Date.now(), sender: { id: currentUserId }, text: messageText, time: 'Just now' }])
            }
            setMessageText('')
        } catch (err) {
            console.error('send message error:', err)
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <section className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </section>
        )
    }

    return (
        <section className="flex-1 max-w-[1400px] mx-auto w-full h-full flex flex-col md:flex-row overflow-hidden border-t border-white/5 bg-[#0E1116]">
            {/* Sidebar (Conversations List) */}
            <aside className="w-full md:w-80 border-r border-white/5 flex flex-col h-full shrink-0">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Messages</h2>
                        <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                            <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="neumorphic-input flex items-center px-4 py-2 rounded-xl">
                        <Search className="w-4 h-4 text-gray-500 mr-2" />
                        <input type="text" placeholder="Search messages..." className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-gray-600" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No messages yet</p>
                            <p className="text-xs text-gray-600 mt-1">Start a conversation with someone in your network.</p>
                        </div>
                    ) : conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => selectConversation(conv)}
                            className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-white/5 ${activeConv?.id === conv.id ? 'bg-white/5 border-l-2 border-l-rose-500' : 'hover:bg-white/[0.02]'}`}
                        >
                            <div className="relative">
                                <img src={conv.user?.avatar || '/default-avatar.png'} className="w-12 h-12 rounded-xl object-cover bg-white/10" alt={conv.user?.name || 'User'} />
                                {conv.unread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0E1116]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={`text-sm truncate ${conv.unread ? 'font-bold text-white' : 'font-medium text-gray-200'}`}>{conv.user?.name || 'Unknown'}</h3>
                                    <span className="text-[10px] text-gray-500">{conv.timestamp}</span>
                                </div>
                                <p className={`text-xs truncate ${conv.unread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>{conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Chat View */}
            <main className="flex-1 flex flex-col h-full relative z-10 bg-[#0E1116]">
                {activeConv ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-6 bg-[#16181D]/50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={activeConv.user?.avatar || '/default-avatar.png'} className="w-10 h-10 rounded-xl object-cover bg-white/10" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#16181D]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">{activeConv.user?.name || 'Unknown'}</h2>
                                    <p className="text-xs text-gray-500 font-medium">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors"><Phone className="w-[18px] h-[18px]" /></button>
                                <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors"><Video className="w-[18px] h-[18px]" /></button>
                                <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors"><MoreVertical className="w-[18px] h-[18px]" /></button>
                            </div>
                        </header>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-gray-500">No messages in this conversation yet. Say hello!</p>
                                </div>
                            ) : messages.map(msg => {
                                const isMe = msg.sender?.id === currentUserId
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <img src={msg.sender?.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full object-cover shrink-0 bg-white/10" />
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-xs font-semibold text-gray-300">{isMe ? 'You' : (msg.sender?.name || 'Unknown')}</span>
                                                <span className="text-[10px] text-gray-500">{msg.time}</span>
                                            </div>
                                            <div className={`px-4 py-2.5 rounded-2xl text-[15px] ${isMe ? 'bg-rose-500 text-white rounded-tr-sm' : 'glass-panel text-gray-200 rounded-tl-sm shadow-none'}`}>
                                                {msg.type === 'attachment' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><Paperclip className="w-5 h-5 opacity-70" /></div>
                                                        <div>
                                                            <p className="font-semibold text-sm">{msg.text}</p>
                                                            <p className="text-[10px] opacity-70">{msg.size}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p>{msg.text}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-[#16181D]/50 backdrop-blur-md">
                            <div className="glass-panel w-full rounded-2xl flex items-end p-2 px-3">
                                <button className="w-10 h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <textarea
                                    className="flex-1 bg-transparent text-white placeholder:text-gray-500 resize-none py-2.5 px-2 focus:outline-none max-h-32 text-sm"
                                    rows={1}
                                    placeholder="Type a message..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                                ></textarea>
                                <button className="w-10 h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !messageText.trim()}
                                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl accent-gradient text-white ml-2 transition-transform hover:scale-105 disabled:opacity-50"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col">
                        <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-300 mb-2">No conversation selected</h3>
                        <p className="text-sm text-gray-500">Select a conversation or start a new one.</p>
                    </div>
                )}
            </main>
        </section>
    )
}
