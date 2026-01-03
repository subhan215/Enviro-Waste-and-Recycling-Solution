/**
 * Rewards API Tests
 * Tests for: reward conversion, reward requests, cancellation
 */

describe('Rewards API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== CONVERT REWARDS ====================
  describe('POST /api/rewards/convert', () => {
    describe('Success Cases', () => {
      it('should convert rewards to cash successfully', async () => {
        global.mockFetch({
          success: true,
          message: 'Conversion request submitted',
          conversion_id: 1,
          amount: 100,
        }, 200);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            points: 1000,
            conversion_type: 'cash',
            bank_details: { account: '1234567890', bank: 'Test Bank' },
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data).toHaveProperty('conversion_id');
      });

      it('should convert rewards to gift card', async () => {
        global.mockFetch({
          success: true,
          message: 'Gift card code generated',
          gift_code: 'GIFT-XXXX-XXXX',
        }, 200);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            points: 500,
            conversion_type: 'gift_card',
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
      });

      it('should deduct points after successful conversion', async () => {
        global.mockFetch({
          success: true,
          remaining_points: 500,
          points_used: 500,
        }, 200);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            points: 500,
            conversion_type: 'cash',
          }),
        });

        const data = await response.json();
        expect(data).toHaveProperty('remaining_points');
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject conversion with insufficient points', async () => {
        global.mockFetch({
          success: false,
          message: 'Insufficient reward points',
        }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            points: 10000,
            conversion_type: 'cash',
          }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe('Insufficient reward points');
      });

      it('should reject conversion without user_id', async () => {
        global.mockFetch({ success: false, message: 'User ID required' }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: 500, conversion_type: 'cash' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject conversion without points', async () => {
        global.mockFetch({ success: false, message: 'Points required' }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, conversion_type: 'cash' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject zero points conversion', async () => {
        global.mockFetch({ success: false, message: 'Points must be greater than 0' }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, points: 0, conversion_type: 'cash' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject negative points', async () => {
        global.mockFetch({ success: false, message: 'Points must be positive' }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, points: -100, conversion_type: 'cash' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid conversion type', async () => {
        global.mockFetch({ success: false, message: 'Invalid conversion type' }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, points: 500, conversion_type: 'bitcoin' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject cash conversion without bank details', async () => {
        global.mockFetch({ success: false, message: 'Bank details required for cash conversion' }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, points: 500, conversion_type: 'cash' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject points below minimum threshold', async () => {
        global.mockFetch({ success: false, message: 'Minimum 100 points required' }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, points: 50, conversion_type: 'cash' }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Pending Request Edge Cases', () => {
      it('should reject if user has pending conversion request', async () => {
        global.mockFetch({ success: false, message: 'Pending conversion request exists' }, 400);

        const response = await fetch('/api/rewards/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, points: 500, conversion_type: 'cash' }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET CURRENT REQUEST ====================
  describe('GET /api/rewards/get_current_request/[user_id]', () => {
    describe('Success Cases', () => {
      it('should fetch current pending request', async () => {
        const mockRequest = {
          request: {
            conversion_id: 1,
            points: 500,
            status: 'pending',
            created_at: '2024-01-15T10:00:00Z',
          },
        };
        global.mockFetch(mockRequest, 200);

        const response = await fetch('/api/rewards/get_current_request/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.request).toHaveProperty('status');
        expect(data.request.status).toBe('pending');
      });

      it('should return null if no pending request', async () => {
        global.mockFetch({ request: null }, 200);

        const response = await fetch('/api/rewards/get_current_request/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.request).toBeNull();
      });

      it('should include conversion details', async () => {
        const mockRequest = {
          request: {
            conversion_id: 1,
            points: 500,
            conversion_type: 'cash',
            amount: 50,
            status: 'approved',
          },
        };
        global.mockFetch(mockRequest, 200);

        const response = await fetch('/api/rewards/get_current_request/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.request).toHaveProperty('conversion_type');
        expect(data.request).toHaveProperty('amount');
      });
    });
  });

  // ==================== CANCEL REQUEST ====================
  describe('DELETE /api/rewards/cancel_request/[request_id]', () => {
    describe('Success Cases', () => {
      it('should cancel pending request', async () => {
        global.mockFetch({ success: true, message: 'Request cancelled successfully' }, 200);

        const response = await fetch('/api/rewards/cancel_request/1', {
          method: 'DELETE',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should restore points after cancellation', async () => {
        global.mockFetch({
          success: true,
          message: 'Request cancelled',
          points_restored: 500,
        }, 200);

        const response = await fetch('/api/rewards/cancel_request/1', {
          method: 'DELETE',
        });

        const data = await response.json();
        expect(data).toHaveProperty('points_restored');
      });
    });

    describe('Edge Cases', () => {
      it('should reject cancellation of non-existent request', async () => {
        global.mockFetch({ success: false, message: 'Request not found' }, 404);

        const response = await fetch('/api/rewards/cancel_request/99999', {
          method: 'DELETE',
        });

        expect(response.status).toBe(404);
      });

      it('should reject cancellation of already processed request', async () => {
        global.mockFetch({ success: false, message: 'Cannot cancel processed request' }, 400);

        const response = await fetch('/api/rewards/cancel_request/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(400);
      });

      it('should reject cancellation of rejected request', async () => {
        global.mockFetch({ success: false, message: 'Request already rejected' }, 400);

        const response = await fetch('/api/rewards/cancel_request/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== MARK AS SEEN ====================
  describe('PUT /api/rewards/mark_as_seen/[conversion_id]', () => {
    describe('Success Cases', () => {
      it('should mark conversion result as seen', async () => {
        global.mockFetch({ success: true, message: 'Marked as seen' }, 200);

        const response = await fetch('/api/rewards/mark_as_seen/1', {
          method: 'PUT',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle non-existent conversion_id', async () => {
        global.mockFetch({ success: false, message: 'Conversion not found' }, 404);

        const response = await fetch('/api/rewards/mark_as_seen/99999', {
          method: 'PUT',
        });

        expect(response.status).toBe(404);
      });

      it('should handle already seen conversion', async () => {
        global.mockFetch({ success: true, message: 'Already marked as seen' }, 200);

        const response = await fetch('/api/rewards/mark_as_seen/1', {
          method: 'PUT',
        });

        expect(response.ok).toBe(true);
      });
    });
  });
});
