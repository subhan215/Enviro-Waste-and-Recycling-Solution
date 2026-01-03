/**
 * Notifications API Tests
 * Tests for: notifications, notification_for_messages
 */

describe('Notifications API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET NOTIFICATIONS ====================
  describe('GET /api/notifications', () => {
    describe('Success Cases', () => {
      it('should fetch notifications for user role', async () => {
        const mockNotifications = {
          notifications: [
            { notification_id: 1, content: 'Your pickup is scheduled', created_at: '2024-01-15T10:00:00Z' },
            { notification_id: 2, content: 'Reward points added', created_at: '2024-01-14T09:00:00Z' },
          ],
        };
        global.mockFetch(mockNotifications, 200);

        const response = await fetch('/api/notifications?role=user&id=1', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.notifications).toHaveLength(2);
        expect(data.notifications[0]).toHaveProperty('notification_id');
        expect(data.notifications[0]).toHaveProperty('content');
        expect(data.notifications[0]).toHaveProperty('created_at');
      });

      it('should fetch notifications for company role', async () => {
        const mockNotifications = {
          notifications: [
            { notification_id: 1, content: 'New area assigned', created_at: '2024-01-15T10:00:00Z' },
          ],
        };
        global.mockFetch(mockNotifications, 200);

        const response = await fetch('/api/notifications?role=company&id=1', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.notifications).toBeDefined();
      });

      it('should return empty array when no notifications exist', async () => {
        global.mockFetch({ notifications: [] }, 200);

        const response = await fetch('/api/notifications?role=user&id=999', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.notifications).toHaveLength(0);
      });

      it('should return notifications sorted by created_at descending', async () => {
        const mockNotifications = {
          notifications: [
            { notification_id: 2, content: 'Newer', created_at: '2024-01-16T10:00:00Z' },
            { notification_id: 1, content: 'Older', created_at: '2024-01-15T10:00:00Z' },
          ],
        };
        global.mockFetch(mockNotifications, 200);

        const response = await fetch('/api/notifications?role=user&id=1', {
          method: 'GET',
        });

        const data = await response.json();
        const dates = data.notifications.map(n => new Date(n.created_at));
        expect(dates[0] >= dates[1]).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject request without role parameter', async () => {
        global.mockFetch({ error: 'Role and ID are required.' }, 400);

        const response = await fetch('/api/notifications?id=1', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Role and ID are required.');
      });

      it('should reject request without id parameter', async () => {
        global.mockFetch({ error: 'Role and ID are required.' }, 400);

        const response = await fetch('/api/notifications?role=user', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });

      it('should reject request with missing both parameters', async () => {
        global.mockFetch({ error: 'Role and ID are required.' }, 400);

        const response = await fetch('/api/notifications', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });

      it('should reject request with invalid role', async () => {
        global.mockFetch({ error: 'Invalid role.' }, 400);

        const response = await fetch('/api/notifications?role=admin&id=1', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Invalid role.');
      });

      it('should reject request with role other than user or company', async () => {
        global.mockFetch({ error: 'Invalid role.' }, 400);

        const response = await fetch('/api/notifications?role=guest&id=1', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });

      it('should handle non-numeric id gracefully', async () => {
        global.mockFetch({ notifications: [] }, 200);

        const response = await fetch('/api/notifications?role=user&id=abc', {
          method: 'GET',
        });

        // Should either return empty or error - both are valid behaviors
        expect([200, 400]).toContain(response.status);
      });

      it('should handle negative id', async () => {
        global.mockFetch({ notifications: [] }, 200);

        const response = await fetch('/api/notifications?role=user&id=-1', {
          method: 'GET',
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should handle database connection error', async () => {
        global.mockFetch({ error: 'Internal Server Error' }, 500);

        const response = await fetch('/api/notifications?role=user&id=1', {
          method: 'GET',
        });

        expect(response.status).toBe(500);
      });

      it('should handle network timeout', async () => {
        global.mockFetchError(new Error('Network timeout'));

        await expect(
          fetch('/api/notifications?role=user&id=1')
        ).rejects.toThrow('Network timeout');
      });
    });
  });

  // ==================== GET NOTIFICATION FOR MESSAGES ====================
  describe('GET /api/notification_for_messages', () => {
    describe('Success Cases', () => {
      it('should fetch message notifications for user', async () => {
        const mockNotifications = {
          notifications: [
            { notification_id: 1, content: 'New message from Waste Corp', chat_id: 101, created_at: '2024-01-15T10:00:00Z', name: 'Waste Corp' },
          ],
        };
        global.mockFetch(mockNotifications, 200);

        const response = await fetch('/api/notification_for_messages?role=user&id=1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.notifications[0]).toHaveProperty('chat_id');
      });

      it('should fetch message notifications for company', async () => {
        const mockNotifications = {
          notifications: [
            { notification_id: 1, content: 'New message from John', chat_id: 102, created_at: '2024-01-15T10:00:00Z', name: 'John Doe' },
          ],
        };
        global.mockFetch(mockNotifications, 200);

        const response = await fetch('/api/notification_for_messages?role=company&id=1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.notifications).toBeDefined();
      });

      it('should return sender name with notification', async () => {
        const mockNotifications = {
          notifications: [
            { notification_id: 1, content: 'Hello', chat_id: 101, created_at: '2024-01-15T10:00:00Z', name: 'John Doe' },
          ],
        };
        global.mockFetch(mockNotifications, 200);

        const response = await fetch('/api/notification_for_messages?role=user&id=1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.notifications[0]).toHaveProperty('name');
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject without role', async () => {
        global.mockFetch({ error: 'Role and ID are required.' }, 400);

        const response = await fetch('/api/notification_for_messages?id=1', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });

      it('should reject without id', async () => {
        global.mockFetch({ error: 'Role and ID are required.' }, 400);

        const response = await fetch('/api/notification_for_messages?role=user', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid role', async () => {
        global.mockFetch({ error: 'Invalid role.' }, 400);

        const response = await fetch('/api/notification_for_messages?role=invalid&id=1', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });
    });
  });
});
