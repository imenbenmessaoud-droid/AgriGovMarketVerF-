import api from './api';

export const messagingService = {
  getConversations: async () => {
    const response = await api.get('messaging/conversations/');
    return response.data.results || response.data;
  },

  startConversation: async (participantId, orderId = null) => {
    const response = await api.post('messaging/conversations/start_conversation/', {
      participant_id: participantId,
      order_id: orderId
    });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`messaging/messages/?conversation=${conversationId}`);
    return response.data.results || response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post('messaging/messages/', {
      conversation: conversationId,
      content: content
    });
    return response.data;
  }
};
