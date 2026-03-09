import { MOCK_CONVERSATIONS, MOCK_USERS } from '../data/mockData'
import { Search, Edit, MoreVertical, Image as ImageIcon, Paperclip, Send, Phone, Video } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Messages() {
    const activeConv = MOCK_CONVERSATIONS.find(c => c.active) || MOCK_CONVERSATIONS[0]

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
                    {MOCK_CONVERSATIONS.map(conv => (
                        <div key={conv.id} className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-white/5 ${conv.active ? 'bg-white/5 border-l-2 border-l-rose-500' : 'hover:bg-white/[0.02]'}`}>
                            <div className="relative">
                                <img src={conv.user.avatar} className="w-12 h-12 rounded-xl object-cover bg-white/10" alt={conv.user.name} />
                                {conv.unread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0E1116]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={`text-sm truncate ${conv.unread ? 'font-bold text-white' : 'font-medium text-gray-200'}`}>{conv.user.name}</h3>
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
                {/* Chat Header */}
                <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-6 bg-[#16181D]/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={activeConv.user.avatar} className="w-10 h-10 rounded-xl object-cover bg-white/10" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#16181D]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">{activeConv.user.name}</h2>
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
                    {activeConv.messages.map(msg => {
                        const isMe = msg.sender.id === MOCK_USERS.currentUser.id
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <img src={msg.sender.avatar} className="w-8 h-8 rounded-full object-cover shrink-0 bg-white/10" />
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-semibold text-gray-300">{isMe ? 'You' : msg.sender.name}</span>
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
                        ></textarea>
                        <button className="w-10 h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl accent-gradient text-white ml-2 transition-transform hover:scale-105">
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </div>
            </main>
        </section>
    )
}
