import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { chatService } from '../services/chat'
import { ChatMessage, Conversation } from '../types'

const Icon = ({ d, cls = 'w-4 h-4' }: { d: string; cls?: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        const convs = await chatService.getUserConversations()
        setConversations(convs)

        if (id) {
          const activeConv = convs.find(c => String(c.id) === String(id)) || await chatService.getConversation(id)
          if (activeConv) {
            setActiveConversation(activeConv)
            const msgs = await chatService.getMessages(String(activeConv.id))
            setMessages(msgs)
          } else {
            navigate('/messages') // Clear invalid ID
          }
        } else if (convs.length > 0) {
          // Auto select first if no ID in URL but navigating to index
          setActiveConversation(convs[0])
          navigate(`/messages/${convs[0].id}`, { replace: true })
          const msgs = await chatService.getMessages(String(convs[0].id))
          setMessages(msgs)
        }
      } catch (error) {
        console.error('Error loading chat data:', error)
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [id, user, navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectConversation = async (conv: Conversation) => {
    navigate(`/messages/${conv.id}`)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || !user) return

    try {
      const message = await chatService.sendMessage(String(activeConversation.id), newMessage)
      setMessages([...messages, message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (!user) return null

  return (
    <div className="bg-gray-50 flex h-[calc(100vh-64px)] overflow-hidden font-sans">
      {/* ── Sidebar: Conversation List ── */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white border-r border-gray-100 flex-shrink-0 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Cộng đồng</h2>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{conversations.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                    <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" cls="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium">Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {conversations.map(conv => {
                const isActive = activeConversation?.id === conv.id
                // Find opponent
                const otherUserId = conv.participants.find(pId => pId !== user.id) || 'Unknown'
                const partnerName = `User ${otherUserId.substring(0, 4)}`

                return (
                  <li key={conv.id}>
                    <button
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full flex items-start gap-4 p-4 text-left transition-colors ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-sm">
                        {partnerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={`text-sm font-bold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                            {partnerName}
                          </h3>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                          {conv.lastMessage?.content || 'Hình ảnh / Tệp đính kèm'}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className={`flex-1 flex flex-col bg-gray-50 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-l border-gray-100">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
              <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" cls="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lời chào Cộng đồng</h2>
            <p className="text-sm text-gray-500 max-w-sm">Chọn một cuộc trò chuyện từ danh sách hoặc liên hệ với người bán thông qua các bài đăng để bắt đầu!</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-6 justify-between flex-shrink-0 z-10 shadow-sm relative">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/messages')}
                  className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Icon d="M15 19l-7-7 7-7" cls="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                    {activeConversation.participants.find(pId => pId !== user.id)?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">User {activeConversation.participants.find(pId => pId !== user.id)?.substring(0, 4)}</h3>
                    <p className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Đang online
                    </p>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                <Icon d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <p className="text-sm font-medium text-gray-400 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-50">Bắt đầu trò chuyện. Gửi lời chào tới đối tác của bạn!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === user.id
                  const prevMsg = messages[index - 1]
                  const showTime = index === 0 || (prevMsg && new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 10 * 60000)

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {showTime && (
                        <div className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-md">
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0 mb-1" />
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-[15px] shadow-sm ${isMe
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                            }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap word-break">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center relative">
                <button type="button" className="absolute left-3 p-2 text-gray-400 hover:text-amber-500 transition-colors">
                  <Icon d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" cls="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="w-full pl-12 pr-14 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 p-2 bg-blue-500 text-white rounded-[14px] hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center"
                >
                  <Icon d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" cls="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
