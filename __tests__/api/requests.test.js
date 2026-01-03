/**
 * Requests API Tests
 * Tests for: recycled waste requests, offers, pricing
 */

describe('Requests API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== CREATE REQUEST FOR RECYCLED WASTE ====================
  describe('POST /api/requests/request_for_recycled_waste', () => {
    describe('Success Cases', () => {
      it('should create request successfully', async () => {
        global.mockFetch({
          success: true,
          message: 'Request created',
          request_id: 1,
        }, 200);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            waste_type: 'plastic',
            quantity: 10,
            unit: 'kg',
            description: 'Clean plastic bottles',
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data).toHaveProperty('request_id');
      });

      it('should accept request with image', async () => {
        global.mockFetch({ success: true, message: 'Request created with image' }, 200);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            waste_type: 'paper',
            quantity: 5,
            unit: 'kg',
            image_url: 'https://example.com/image.jpg',
          }),
        });

        expect(response.ok).toBe(true);
      });

      it('should accept multiple waste types', async () => {
        global.mockFetch({ success: true, message: 'Request created' }, 200);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            waste_type: 'mixed',
            quantity: 20,
            unit: 'kg',
            waste_details: ['plastic', 'paper', 'metal'],
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject without user_id', async () => {
        global.mockFetch({ success: false, message: 'User ID required' }, 400);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ waste_type: 'plastic', quantity: 10 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without waste_type', async () => {
        global.mockFetch({ success: false, message: 'Waste type required' }, 400);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, quantity: 10 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without quantity', async () => {
        global.mockFetch({ success: false, message: 'Quantity required' }, 400);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, waste_type: 'plastic' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject zero quantity', async () => {
        global.mockFetch({ success: false, message: 'Quantity must be greater than 0' }, 400);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, waste_type: 'plastic', quantity: 0 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject negative quantity', async () => {
        global.mockFetch({ success: false, message: 'Quantity must be positive' }, 400);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, waste_type: 'plastic', quantity: -5 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid waste type', async () => {
        global.mockFetch({ success: false, message: 'Invalid waste type' }, 400);

        const response = await fetch('/api/requests/request_for_recycled_waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, waste_type: 'nuclear', quantity: 10 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET REQUESTS FOR USER ====================
  describe('GET /api/requests/request_for_recycled_waste/[user_id]', () => {
    describe('Success Cases', () => {
      it('should fetch user requests', async () => {
        const mockRequests = {
          requests: [
            {
              request_id: 1,
              waste_type: 'plastic',
              quantity: 10,
              status: 'pending',
              created_at: '2024-01-15T10:00:00Z',
            },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/requests/request_for_recycled_waste/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.requests).toBeDefined();
      });

      it('should include offer information if exists', async () => {
        const mockRequests = {
          requests: [
            {
              request_id: 1,
              waste_type: 'plastic',
              quantity: 10,
              offers: [
                { offer_id: 1, company_name: 'Waste Corp', price: 50 },
              ],
            },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/requests/request_for_recycled_waste/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.requests[0]).toHaveProperty('offers');
      });

      it('should return empty for user with no requests', async () => {
        global.mockFetch({ requests: [] }, 200);

        const response = await fetch('/api/requests/request_for_recycled_waste/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.requests).toHaveLength(0);
      });
    });
  });

  // ==================== GET REQUESTS NEAR COMPANY ====================
  describe('GET /api/requests/get_requests_near_company/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch requests near company area', async () => {
        const mockRequests = {
          requests: [
            {
              request_id: 1,
              user_name: 'John Doe',
              area_name: 'Downtown',
              waste_type: 'plastic',
              quantity: 10,
            },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/requests/get_requests_near_company/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.requests).toBeDefined();
      });

      it('should only return pending requests', async () => {
        const mockRequests = {
          requests: [
            { request_id: 1, status: 'pending' },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/requests/get_requests_near_company/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.requests.every(r => r.status === 'pending')).toBe(true);
      });
    });
  });

  // ==================== OFFER PRICE ====================
  describe('POST /api/requests/offer_price', () => {
    describe('Success Cases', () => {
      it('should submit price offer', async () => {
        global.mockFetch({
          success: true,
          message: 'Offer submitted',
          offer_id: 1,
        }, 200);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: 1,
            company_id: 1,
            price: 50,
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should accept offer with pickup date', async () => {
        global.mockFetch({ success: true, message: 'Offer submitted' }, 200);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: 1,
            company_id: 1,
            price: 50,
            pickup_date: '2024-01-20',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject without request_id', async () => {
        global.mockFetch({ success: false, message: 'Request ID required' }, 400);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, price: 50 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without company_id', async () => {
        global.mockFetch({ success: false, message: 'Company ID required' }, 400);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, price: 50 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without price', async () => {
        global.mockFetch({ success: false, message: 'Price required' }, 400);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, company_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject zero price', async () => {
        global.mockFetch({ success: false, message: 'Price must be greater than 0' }, 400);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, company_id: 1, price: 0 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject negative price', async () => {
        global.mockFetch({ success: false, message: 'Price must be positive' }, 400);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, company_id: 1, price: -10 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject duplicate offer from same company', async () => {
        global.mockFetch({ success: false, message: 'Already submitted offer' }, 400);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, company_id: 1, price: 50 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject offer for closed request', async () => {
        global.mockFetch({ success: false, message: 'Request is closed' }, 400);

        const response = await fetch('/api/requests/offer_price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, company_id: 1, price: 50 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== ACCEPT OFFER ====================
  describe('POST /api/requests/accept_Offer', () => {
    describe('Success Cases', () => {
      it('should accept offer successfully', async () => {
        global.mockFetch({
          success: true,
          message: 'Offer accepted',
          schedule_id: 1,
        }, 200);

        const response = await fetch('/api/requests/accept_Offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: 1, user_id: 1 }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should create schedule after accepting offer', async () => {
        global.mockFetch({
          success: true,
          schedule_id: 1,
          pickup_date: '2024-01-20',
        }, 200);

        const response = await fetch('/api/requests/accept_Offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: 1, user_id: 1 }),
        });

        const data = await response.json();
        expect(data).toHaveProperty('schedule_id');
      });
    });

    describe('Edge Cases', () => {
      it('should reject without offer_id', async () => {
        global.mockFetch({ success: false, message: 'Offer ID required' }, 400);

        const response = await fetch('/api/requests/accept_Offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-existent offer', async () => {
        global.mockFetch({ success: false, message: 'Offer not found' }, 404);

        const response = await fetch('/api/requests/accept_Offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: 99999, user_id: 1 }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject if not request owner', async () => {
        global.mockFetch({ success: false, message: 'Unauthorized' }, 403);

        const response = await fetch('/api/requests/accept_Offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: 1, user_id: 999 }),
        });

        expect(response.status).toBe(403);
      });

      it('should reject if another offer already accepted', async () => {
        global.mockFetch({ success: false, message: 'Request already has accepted offer' }, 400);

        const response = await fetch('/api/requests/accept_Offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: 2, user_id: 1 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== DELETE REQUEST ====================
  describe('DELETE /api/requests/delete_request/[request_id]', () => {
    describe('Success Cases', () => {
      it('should delete request successfully', async () => {
        global.mockFetch({ success: true, message: 'Request deleted' }, 200);

        const response = await fetch('/api/requests/delete_request/1', {
          method: 'DELETE',
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject deletion of non-existent request', async () => {
        global.mockFetch({ success: false, message: 'Request not found' }, 404);

        const response = await fetch('/api/requests/delete_request/99999', {
          method: 'DELETE',
        });

        expect(response.status).toBe(404);
      });

      it('should reject deletion of request with accepted offer', async () => {
        global.mockFetch({ success: false, message: 'Cannot delete request with accepted offer' }, 400);

        const response = await fetch('/api/requests/delete_request/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET WASTE PRICE ====================
  describe('GET /api/requests/get_waste_price', () => {
    describe('Success Cases', () => {
      it('should fetch waste prices', async () => {
        const mockPrices = {
          prices: [
            { waste_type: 'plastic', price_per_kg: 5 },
            { waste_type: 'paper', price_per_kg: 3 },
            { waste_type: 'metal', price_per_kg: 10 },
          ],
        };
        global.mockFetch(mockPrices, 200);

        const response = await fetch('/api/requests/get_waste_price', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.prices).toBeDefined();
        expect(data.prices.length).toBeGreaterThan(0);
      });

      it('should include all waste types', async () => {
        const mockPrices = {
          prices: [
            { waste_type: 'plastic', price_per_kg: 5 },
            { waste_type: 'paper', price_per_kg: 3 },
            { waste_type: 'metal', price_per_kg: 10 },
            { waste_type: 'glass', price_per_kg: 2 },
            { waste_type: 'electronics', price_per_kg: 15 },
          ],
        };
        global.mockFetch(mockPrices, 200);

        const response = await fetch('/api/requests/get_waste_price', {
          method: 'GET',
        });

        const data = await response.json();
        const wasteTypes = data.prices.map(p => p.waste_type);
        expect(wasteTypes).toContain('plastic');
        expect(wasteTypes).toContain('paper');
        expect(wasteTypes).toContain('metal');
      });
    });
  });
});
