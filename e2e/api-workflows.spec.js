/**
 * API Workflow E2E Tests
 * Tests API endpoints via frontend interactions
 */

const { test, expect } = require('@playwright/test');

test.describe('API Integration Workflows', () => {
  test.describe('Public API Endpoints', () => {
    test('should fetch areas data', async ({ request }) => {
      const response = await request.get('/api/area/get_all_areas');

      expect(response.ok() || response.status() === 401).toBeTruthy();
    });

    test('should fetch non-served areas', async ({ request }) => {
      const response = await request.get('/api/area/get_all_non_served_areas');

      expect(response.ok() || response.status() === 401).toBeTruthy();
    });
  });

  test.describe('Notifications API', () => {
    test('should require role and id parameters', async ({ request }) => {
      const response = await request.get('/api/notifications');

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    test('should require valid role', async ({ request }) => {
      const response = await request.get('/api/notifications?role=invalid&id=1');

      expect(response.status()).toBe(400);
    });

    test('should accept user role', async ({ request }) => {
      const response = await request.get('/api/notifications?role=user&id=1');

      // Should either succeed or return empty
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should accept company role', async ({ request }) => {
      const response = await request.get('/api/notifications?role=company&id=1');

      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Authentication API', () => {
    test('should reject signin without credentials', async ({ request }) => {
      const response = await request.post('/api/users/signin', {
        data: {},
      });

      expect(response.status()).toBe(400);
    });

    test('should reject signin with empty email', async ({ request }) => {
      const response = await request.post('/api/users/signin', {
        data: { email: '', password: 'Password123!' },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject signin with empty password', async ({ request }) => {
      const response = await request.post('/api/users/signin', {
        data: { email: 'test@example.com', password: '' },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject signin with non-existent user', async ({ request }) => {
      const response = await request.post('/api/users/signin', {
        data: {
          email: 'nonexistent@test-user-that-does-not-exist.com',
          password: 'Password123!',
        },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Signup API', () => {
    test('should reject signup without required fields', async ({ request }) => {
      const response = await request.post('/api/users/signup', {
        data: {},
      });

      expect(response.status()).toBe(400);
    });

    test('should reject signup with invalid email', async ({ request }) => {
      const response = await request.post('/api/users/signup', {
        data: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          gender: 'male',
          age: 25,
          mobile: '1234567890',
          area_id: 1,
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject signup with weak password', async ({ request }) => {
      const response = await request.post('/api/users/signup', {
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
          confirmPassword: '123',
          gender: 'male',
          age: 25,
          mobile: '1234567890',
          area_id: 1,
        },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Schedule API', () => {
    test('should handle get schedule for user', async ({ request }) => {
      const response = await request.get('/api/schedule/get_schedule_for_user/1');

      // Should return data or require auth
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should handle get schedule for company', async ({ request }) => {
      const response = await request.get('/api/schedule/get_schedules_for_company/1');

      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Rewards API', () => {
    test('should handle get rewards', async ({ request }) => {
      const response = await request.get('/api/schedule/get_rewards/1');

      expect([200, 401, 403]).toContain(response.status());
    });

    test('should handle get current request', async ({ request }) => {
      const response = await request.get('/api/rewards/get_current_request/1');

      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Chat API', () => {
    test('should require parameters for get_chats', async ({ request }) => {
      const response = await request.get('/api/chat/get_chats');

      expect(response.status()).toBe(400);
    });

    test('should handle get_chats with valid params', async ({ request }) => {
      const response = await request.get('/api/chat/get_chats?role=user&id=1');

      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Report API', () => {
    test('should handle get reports for user', async ({ request }) => {
      const response = await request.get('/api/report/get_report/1');

      expect([200, 401, 403]).toContain(response.status());
    });

    test('should handle get all reports', async ({ request }) => {
      const response = await request.get('/api/report/get_all_reports');

      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Company API', () => {
    test('should handle check agreement', async ({ request }) => {
      const response = await request.get('/api/company/check-agreement?company_id=1');

      expect([200, 400, 401, 403]).toContain(response.status());
    });

    test('should reject check agreement without company_id', async ({ request }) => {
      const response = await request.get('/api/company/check-agreement');

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Trucks API', () => {
    test('should handle get trucks information', async ({ request }) => {
      const response = await request.get('/api/trucks/get_Trucks_Information/1');

      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Manhole API', () => {
    test('should handle get manhole reports for user', async ({ request }) => {
      const response = await request.get('/api/manhole/get_all_for_user/1');

      expect([200, 401, 403]).toContain(response.status());
    });

    test('should handle get manhole reports for company', async ({ request }) => {
      const response = await request.get('/api/manhole/get_all_for_company/1');

      expect([200, 401, 403]).toContain(response.status());
    });
  });
});
