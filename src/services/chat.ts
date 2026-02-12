import { ChatMessage, Conversation } from '../types/index'
import { apiRequest } from './api'

interface StartConversationRequest {
  participantId: string
  listingId: string
}

interface SendMessageRequest {
  content: string
}

interface ConversationDto {
  id: string
  participants: string[]
  listingId: string
  createdAt: string
  lastMessage?: MessageDto
  lastMessageAt?: string
}

interface MessageDto {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  readAt?: string
}

class ChatService {
  /**
   * Create or get existing conversation with another user
   */
  async createConversation(
    participant1Id: string,
    participant2Id: string,
    listingId: string
  ): Promise<Conversation> {
    try {
      const response = await apiRequest<{ conversationId: string }>(
        '/api/messages/conversations',
        {
          method: 'POST',
          body: {
            participantId: participant2Id,
            listingId: listingId,
          },
          auth: true,
        }
      )
      
      // Convert response to Conversation type
      return {
        id: response.conversationId,
        participants: [participant1Id, participant2Id],
        listingId,
        createdAt: new Date(),
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  /**
   * Get a specific conversation
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const response = await apiRequest<ConversationDto>(
        `/api/messages/conversations/${conversationId}`,
        { auth: true }
      )
      
      return {
        id: response.id,
        participants: response.participants,
        listingId: response.listingId,
        createdAt: new Date(response.createdAt),
        lastMessage: response.lastMessage
          ? {
              id: response.lastMessage.id,
              conversationId: response.lastMessage.conversationId,
              senderId: response.lastMessage.senderId,
              senderName: response.lastMessage.senderName,
              content: response.lastMessage.content,
              createdAt: new Date(response.lastMessage.createdAt),
            }
          : undefined,
        lastMessageAt: response.lastMessageAt
          ? new Date(response.lastMessageAt)
          : undefined,
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  /**
   * Get all conversations for current user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await apiRequest<ConversationDto[]>(
        '/api/messages/conversations',
        { auth: true }
      )

      return (response || []).map((conv) => ({
        id: conv.id,
        participants: conv.participants,
        listingId: conv.listingId,
        createdAt: new Date(conv.createdAt),
        lastMessage: conv.lastMessage
          ? {
              id: conv.lastMessage.id,
              conversationId: conv.lastMessage.conversationId,
              senderId: conv.lastMessage.senderId,
              senderName: conv.lastMessage.senderName,
              content: conv.lastMessage.content,
              createdAt: new Date(conv.lastMessage.createdAt),
            }
          : undefined,
        lastMessageAt: conv.lastMessageAt
          ? new Date(conv.lastMessageAt)
          : undefined,
      }))
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return []
    }
  }

  /**
   * Send message to a conversation
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string
  ): Promise<ChatMessage> {
    try {
      const response = await apiRequest<MessageDto>(
        `/api/messages/conversations/${conversationId}`,
        {
          method: 'POST',
          body: { content },
          auth: true,
        }
      )

      return {
        id: response.id,
        conversationId: response.conversationId,
        senderId: response.senderId,
        senderName: response.senderName,
        content: response.content,
        createdAt: new Date(response.createdAt),
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiRequest<MessageDto[]>(
        `/api/messages/conversations/${conversationId}`,
        { auth: true }
      )

      return (response || []).map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
        readAt: msg.readAt ? new Date(msg.readAt) : undefined,
      }))
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  /**
   * Mark message as read (optional - may implement later)
   */
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      // TODO: Implement if backend has endpoint
      console.log('Mark as read:', messageId)
      return true
    } catch (error) {
      console.error('Error marking as read:', error)
      return false
    }
  }

  /**
   * Get unread message count (TODO: implement with backend)
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const conversations = await this.getUserConversations(userId)
      let unreadCount = 0
      
      for (const conv of conversations) {
        const messages = await this.getMessages(conv.id as string)
        unreadCount += messages.filter((m) => !m.readAt && m.senderId !== userId).length
      }
      
      return unreadCount
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}

export const chatService = new ChatService()
