import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { chatService } from '../services/chat'
import { ChatMessage, Conversation } from '../types'

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConversation = async () => {
      if (!user || !id) {
        navigate('/listings')
        return
      }

      try {
        const conv = await chatService.getConversation(id)
        if (!conv || !conv.participants.includes(user.id)) {
          navigate('/listings')
          return
        }

        setConversation(conv)
        const msgs = await chatService.getMessages(id)
        setMessages(msgs)
      } catch (error) {
        console.error('Error loading conversation:', error)
        navigate('/listings')
      } finally {
        setLoading(false)
      }
    }

    void loadConversation()
  }, [id, user, navigate])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversation || !user) return

    try {
      const message = await chatService.sendMessage(
        conversation.id as string,
        newMessage
      )

      setMessages([...messages, message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600">Vui lòng đăng nhập</p>
      </div>
    )
  }

  if (loading || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  const otherUserId = conversation.participants.find((id) => id !== user.id)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-96">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div>
              <h1 className="font-bold">Tin nhắn</h1>
              <p className="text-sm text-blue-100">ID: {otherUserId}</p>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="text-blue-100 hover:text-white"
            >
              X
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                      }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${msg.senderId === user.id
                          ? 'text-blue-100'
                          : 'text-gray-600'
                        }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
