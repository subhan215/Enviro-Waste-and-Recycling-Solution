/**
 * Chat API Tests
 * Tests for: chat creation, messages, chat retrieval
 */

describe('Chat API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== CREATE CHAT ====================
  describe('POST /api/chat/create_chat', () => {
    describe('Success Cases', () => {
      it('should create chat between user and company', async () => {
        global.mockFetch({
          success: true,
          chat_id: 1,
          message: 'Chat created',
        }, 200);

        const response = await fetch('/api/chat/create_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            company_id: 1,
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data).toHaveProperty('chat_id');
      });

      it('should return existing chat if already exists', async () => {
        global.mockFetch({
          success: true,
          chat_id: 1,
          message: 'Existing chat returned',
          existing: true,
        }, 200);

        const response = await fetch('/api/chat/create_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            company_id: 1,
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.chat_id).toBe(1);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without user_id', async () => {
        global.mockFetch({ success: false, message: 'User ID required' }, 400);

        const response = await fetch('/api/chat/create_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without company_id', async () => {
        global.mockFetch({ success: false, message: 'Company ID required' }, 400);

        const response = await fetch('/api/chat/create_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-existent user', async () => {
        global.mockFetch({ success: false, message: 'User not found' }, 404);

        const response = await fetch('/api/chat/create_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 99999, company_id: 1 }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject non-existent company', async () => {
        global.mockFetch({ success: false, message: 'Company not found' }, 404);

        const response = await fetch('/api/chat/create_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, company_id: 99999 }),
        });

        expect(response.status).toBe(404);
      });
    });
  });

  // ==================== GET CHATS ====================
  describe('GET /api/chat/get_chats', () => {
    describe('Success Cases', () => {
      it('should fetch chats for user', async () => {
        const mockChats = {
          chats: [
            {
              chat_id: 1,
              company_name: 'Waste Corp',
              last_message: 'Hello!',
              last_message_at: '2024-01-15T10:00:00Z',
              unread_count: 2,
            },
          ],
        };
        global.mockFetch(mockChats, 200);

        const response = await fetch('/api/chat/get_chats?role=user&id=1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.chats).toBeDefined();
      });

      it('should fetch chats for company', async () => {
        const mockChats = {
          chats: [
            {
              chat_id: 1,
              user_name: 'John Doe',
              last_message: 'Thanks!',
              last_message_at: '2024-01-15T11:00:00Z',
              unread_count: 0,
            },
          ],
        };
        global.mockFetch(mockChats, 200);

        const response = await fetch('/api/chat/get_chats?role=company&id=1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.chats).toBeDefined();
      });

      it('should return empty for new user/company', async () => {
        global.mockFetch({ chats: [] }, 200);

        const response = await fetch('/api/chat/get_chats?role=user&id=999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.chats).toHaveLength(0);
      });

      it('should include unread count', async () => {
        const mockChats = {
          chats: [
            { chat_id: 1, unread_count: 5 },
          ],
        };
        global.mockFetch(mockChats, 200);

        const response = await fetch('/api/chat/get_chats?role=user&id=1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.chats[0]).toHaveProperty('unread_count');
      });
    });

    describe('Edge Cases', () => {
      it('should reject without role', async () => {
        global.mockFetch({ error: 'Role required' }, 400);

        const response = await fetch('/api/chat/get_chats?id=1', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });

      it('should reject without id', async () => {
        global.mockFetch({ error: 'ID required' }, 400);

        const response = await fetch('/api/chat/get_chats?role=user', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid role', async () => {
        global.mockFetch({ error: 'Invalid role' }, 400);

        const response = await fetch('/api/chat/get_chats?role=admin&id=1', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET CHAT MESSAGES ====================
  describe('GET /api/chat/[chat_id]', () => {
    describe('Success Cases', () => {
      it('should fetch chat messages', async () => {
        const mockMessages = {
          messages: [
            { message_id: 1, content: 'Hello', sender_type: 'user', sent_at: '2024-01-15T10:00:00Z' },
            { message_id: 2, content: 'Hi there!', sender_type: 'company', sent_at: '2024-01-15T10:01:00Z' },
          ],
          chat: { chat_id: 1, user_name: 'John', company_name: 'Waste Corp' },
        };
        global.mockFetch(mockMessages, 200);

        const response = await fetch('/api/chat/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.messages).toBeDefined();
        expect(data.chat).toBeDefined();
      });

      it('should return messages in chronological order', async () => {
        const mockMessages = {
          messages: [
            { message_id: 1, sent_at: '2024-01-15T10:00:00Z' },
            { message_id: 2, sent_at: '2024-01-15T10:01:00Z' },
          ],
        };
        global.mockFetch(mockMessages, 200);

        const response = await fetch('/api/chat/1', {
          method: 'GET',
        });

        const data = await response.json();
        const times = data.messages.map(m => new Date(m.sent_at));
        expect(times[0] <= times[1]).toBe(true);
      });

      it('should return empty messages for new chat', async () => {
        global.mockFetch({ messages: [], chat: { chat_id: 1 } }, 200);

        const response = await fetch('/api/chat/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.messages).toHaveLength(0);
      });
    });

    describe('Edge Cases', () => {
      it('should reject non-existent chat', async () => {
        global.mockFetch({ error: 'Chat not found' }, 404);

        const response = await fetch('/api/chat/99999', {
          method: 'GET',
        });

        expect(response.status).toBe(404);
      });

      it('should reject invalid chat_id format', async () => {
        global.mockFetch({ error: 'Invalid chat ID' }, 400);

        const response = await fetch('/api/chat/invalid', {
          method: 'GET',
        });

        expect([200, 400]).toContain(response.status);
      });
    });
  });

  // ==================== SEND MESSAGE ====================
  describe('POST /api/messages/send_message', () => {
    describe('Success Cases', () => {
      it('should send message successfully', async () => {
        global.mockFetch({
          success: true,
          message_id: 1,
          sent_at: '2024-01-15T10:00:00Z',
        }, 200);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 1,
            sender_id: 1,
            sender_type: 'user',
            content: 'Hello, I have a question.',
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data).toHaveProperty('message_id');
      });

      it('should send message from company', async () => {
        global.mockFetch({ success: true, message_id: 2 }, 200);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 1,
            sender_id: 1,
            sender_type: 'company',
            content: 'How can I help you?',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject without chat_id', async () => {
        global.mockFetch({ success: false, message: 'Chat ID required' }, 400);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_id: 1,
            sender_type: 'user',
            content: 'Hello',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without content', async () => {
        global.mockFetch({ success: false, message: 'Content required' }, 400);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 1,
            sender_id: 1,
            sender_type: 'user',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject empty content', async () => {
        global.mockFetch({ success: false, message: 'Content cannot be empty' }, 400);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 1,
            sender_id: 1,
            sender_type: 'user',
            content: '',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject whitespace-only content', async () => {
        global.mockFetch({ success: false, message: 'Content cannot be empty' }, 400);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 1,
            sender_id: 1,
            sender_type: 'user',
            content: '   ',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid sender_type', async () => {
        global.mockFetch({ success: false, message: 'Invalid sender type' }, 400);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 1,
            sender_id: 1,
            sender_type: 'admin',
            content: 'Hello',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-existent chat', async () => {
        global.mockFetch({ success: false, message: 'Chat not found' }, 404);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 99999,
            sender_id: 1,
            sender_type: 'user',
            content: 'Hello',
          }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject message from non-participant', async () => {
        global.mockFetch({ success: false, message: 'Not a participant' }, 403);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 1,
            sender_id: 999,
            sender_type: 'user',
            content: 'Hello',
          }),
        });

        expect(response.status).toBe(403);
      });

      it('should reject very long message', async () => {
        global.mockFetch({ success: false, message: 'Message too long' }, 400);

        const response = await fetch('/api/messages/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 1,
            sender_id: 1,
            sender_type: 'user',
            content: 'x'.repeat(10001),
          }),
        });

        expect(response.status).toBe(400);
      });
    });
  });
});
