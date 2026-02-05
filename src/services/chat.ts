import { ChatMessage, Conversation } from '../types/index'

class ChatService {
  private conversations: Conversation[] = []
  private messages: ChatMessage[] = []

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('conversations')
    const storedMessages = localStorage.getItem('messages')
    if (stored) this.conversations = JSON.parse(stored)
    if (storedMessages) this.messages = JSON.parse(storedMessages)
  }

  private saveToStorage(): void {
    localStorage.setItem('conversations', JSON.stringify(this.conversations))
    localStorage.setItem('messages', JSON.stringify(this.messages))
  }

  createConversation(
    participant1Id: string,
    participant2Id: string,
    listingId: string
  ): Conversation {
    const existingConv = this.conversations.find(
      (c) =>
        c.listingId === listingId &&
        c.participants.includes(participant1Id) &&
        c.participants.includes(participant2Id)
    )

    if (existingConv) return existingConv

    const conversation: Conversation = {
      id: Date.now(),
      participants: [participant1Id, participant2Id],
      listingId,
      createdAt: new Date(),
    }

    this.conversations.push(conversation)
    this.saveToStorage()
    return conversation
  }

  getConversation(conversationId: number): Conversation | null {
    return this.conversations.find((c) => c.id === conversationId) || null
  }

  getUserConversations(userId: string): Conversation[] {
    return this.conversations
      .filter((c) => c.participants.includes(userId))
      .sort((a, b) => (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0))
  }

  sendMessage(
    conversationId: number,
    senderId: string,
    senderName: string,
    content: string
  ): ChatMessage {
    const message: ChatMessage = {
      id: Date.now(),
      conversationId,
      senderId,
      senderName,
      content,
      createdAt: new Date(),
    }

    this.messages.push(message)

    // Update conversation last message
    const conversation = this.getConversation(conversationId)
    if (conversation) {
      conversation.lastMessage = message
      conversation.lastMessageAt = message.createdAt
    }

    this.saveToStorage()
    return message
  }

  getMessages(conversationId: number): ChatMessage[] {
    return this.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  markAsRead(messageId: number): void {
    const message = this.messages.find((m) => m.id === messageId)
    if (message) {
      message.readAt = new Date()
      this.saveToStorage()
    }
  }

  getUnreadCount(userId: string): number {
    return this.messages.filter((m) => !m.readAt && m.senderId !== userId).length
  }
}

export const chatService = new ChatService()
