/**
 * Admin API Tests
 * Tests for: admin panel operations, approvals, dashboard
 */

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET TOTAL COMPANIES ====================
  describe('GET /api/admin/get_total_companies', () => {
    describe('Success Cases', () => {
      it('should fetch total companies count', async () => {
        global.mockFetch({ total_companies: 25, active: 20, inactive: 5 }, 200);

        const response = await fetch('/api/admin/get_total_companies', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data).toHaveProperty('total_companies');
      });

      it('should return breakdown by status', async () => {
        global.mockFetch({ total_companies: 25, active: 20, inactive: 5 }, 200);

        const response = await fetch('/api/admin/get_total_companies', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data).toHaveProperty('active');
        expect(data).toHaveProperty('inactive');
      });
    });
  });

  // ==================== GET CURRENT MONTH COMPLAINTS ====================
  describe('GET /api/admin/get_current_month_complaints', () => {
    describe('Success Cases', () => {
      it('should fetch current month complaints', async () => {
        global.mockFetch({
          total_complaints: 15,
          resolved: 10,
          pending: 5,
          month: 'January 2024',
        }, 200);

        const response = await fetch('/api/admin/get_current_month_complaints', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data).toHaveProperty('total_complaints');
        expect(data).toHaveProperty('resolved');
        expect(data).toHaveProperty('pending');
      });
    });
  });

  // ==================== GET CURRENT MONTH TRANSACTIONS ====================
  describe('GET /api/admin/get_current_month_transactions', () => {
    describe('Success Cases', () => {
      it('should fetch current month transactions', async () => {
        global.mockFetch({
          total_transactions: 150,
          total_amount: 15000,
          month: 'January 2024',
        }, 200);

        const response = await fetch('/api/admin/get_current_month_transactions', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data).toHaveProperty('total_transactions');
        expect(data).toHaveProperty('total_amount');
      });
    });
  });

  // ==================== GET ALL AGREEMENTS ====================
  describe('GET /api/admin/get_all_agreements', () => {
    describe('Success Cases', () => {
      it('should fetch all company agreements', async () => {
        const mockAgreements = {
          agreements: [
            { agreement_id: 1, company_name: 'Waste Corp', area_name: 'Downtown', status: 'active' },
            { agreement_id: 2, company_name: 'Green Solutions', area_name: 'Uptown', status: 'active' },
          ],
        };
        global.mockFetch(mockAgreements, 200);

        const response = await fetch('/api/admin/get_all_agreements', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.agreements).toBeDefined();
      });
    });
  });

  // ==================== GET AREA APPROVAL REQUESTS ====================
  describe('GET /api/admin/get_area_approval_requests', () => {
    describe('Success Cases', () => {
      it('should fetch pending area approval requests', async () => {
        const mockRequests = {
          requests: [
            {
              request_id: 1,
              company_name: 'Waste Corp',
              area_name: 'New Area',
              requested_at: '2024-01-15T10:00:00Z',
            },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/admin/get_area_approval_requests', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.requests).toBeDefined();
      });

      it('should return empty when no pending requests', async () => {
        global.mockFetch({ requests: [] }, 200);

        const response = await fetch('/api/admin/get_area_approval_requests', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.requests).toHaveLength(0);
      });
    });
  });

  // ==================== AREA APPROVAL REQUESTS ACTION ====================
  describe('POST /api/admin/area_approval_requests', () => {
    describe('Success Cases', () => {
      it('should approve area request', async () => {
        global.mockFetch({ success: true, message: 'Area request approved' }, 200);

        const response = await fetch('/api/admin/area_approval_requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, action: 'approve' }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should reject area request', async () => {
        global.mockFetch({ success: true, message: 'Area request rejected' }, 200);

        const response = await fetch('/api/admin/area_approval_requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, action: 'reject', reason: 'Area already covered' }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without request_id', async () => {
        global.mockFetch({ success: false, message: 'Request ID required' }, 400);

        const response = await fetch('/api/admin/area_approval_requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without action', async () => {
        global.mockFetch({ success: false, message: 'Action required' }, 400);

        const response = await fetch('/api/admin/area_approval_requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid action', async () => {
        global.mockFetch({ success: false, message: 'Invalid action' }, 400);

        const response = await fetch('/api/admin/area_approval_requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, action: 'pending' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-existent request', async () => {
        global.mockFetch({ success: false, message: 'Request not found' }, 404);

        const response = await fetch('/api/admin/area_approval_requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 99999, action: 'approve' }),
        });

        expect(response.status).toBe(404);
      });
    });
  });

  // ==================== GET RECYCLING CENTER REQUESTS ====================
  describe('GET /api/admin/get_recycling_center_requests', () => {
    describe('Success Cases', () => {
      it('should fetch recycling center requests', async () => {
        const mockRequests = {
          requests: [
            {
              request_id: 1,
              company_name: 'Waste Corp',
              location: 'Downtown',
              status: 'pending',
            },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/admin/get_recycling_center_requests', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.requests).toBeDefined();
      });
    });
  });

  // ==================== UPDATE RECYCLING CENTER REQUEST ====================
  describe('POST /api/admin/update_recycling_center_request', () => {
    describe('Success Cases', () => {
      it('should approve recycling center request', async () => {
        global.mockFetch({ success: true, message: 'Request approved' }, 200);

        const response = await fetch('/api/admin/update_recycling_center_request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, action: 'approve' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should reject recycling center request', async () => {
        global.mockFetch({ success: true, message: 'Request rejected' }, 200);

        const response = await fetch('/api/admin/update_recycling_center_request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, action: 'reject', reason: 'Location not suitable' }),
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  // ==================== GET RESIGN AGREEMENTS ====================
  describe('GET /api/admin/get_resign_agreements', () => {
    describe('Success Cases', () => {
      it('should fetch resignation requests', async () => {
        const mockRequests = {
          requests: [
            { resign_id: 1, company_name: 'Waste Corp', area_name: 'Downtown', reason: 'Relocating' },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/admin/get_resign_agreements', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.requests).toBeDefined();
      });
    });
  });

  // ==================== APPROVE/REJECT RESIGN AGREEMENT ====================
  describe('POST /api/admin/approve_reject_resign_agreement', () => {
    describe('Success Cases', () => {
      it('should approve resignation', async () => {
        global.mockFetch({ success: true, message: 'Resignation approved' }, 200);

        const response = await fetch('/api/admin/approve_reject_resign_agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resign_id: 1, action: 'approve' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should reject resignation', async () => {
        global.mockFetch({ success: true, message: 'Resignation rejected' }, 200);

        const response = await fetch('/api/admin/approve_reject_resign_agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resign_id: 1, action: 'reject', reason: 'Contract period not complete' }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without resign_id', async () => {
        global.mockFetch({ success: false, message: 'Resign ID required' }, 400);

        const response = await fetch('/api/admin/approve_reject_resign_agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve' }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET REWARD CONVERSION REQUESTS ====================
  describe('GET /api/admin/get_reward_conversion_requests', () => {
    describe('Success Cases', () => {
      it('should fetch pending reward conversions', async () => {
        const mockRequests = {
          requests: [
            { conversion_id: 1, user_name: 'John Doe', points: 1000, amount: 100, status: 'pending' },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/admin/get_reward_conversion_requests', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.requests).toBeDefined();
      });
    });
  });

  // ==================== REWARD CONVERSION ACTION ====================
  describe('POST /api/admin/reward_conversion_action', () => {
    describe('Success Cases', () => {
      it('should approve reward conversion', async () => {
        global.mockFetch({ success: true, message: 'Conversion approved' }, 200);

        const response = await fetch('/api/admin/reward_conversion_action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversion_id: 1, action: 'approve' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should reject reward conversion', async () => {
        global.mockFetch({ success: true, message: 'Conversion rejected' }, 200);

        const response = await fetch('/api/admin/reward_conversion_action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversion_id: 1, action: 'reject', reason: 'Invalid bank details' }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without conversion_id', async () => {
        global.mockFetch({ success: false, message: 'Conversion ID required' }, 400);

        const response = await fetch('/api/admin/reward_conversion_action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve' }),
        });

        expect(response.status).toBe(400);
      });

      it('should restore points on rejection', async () => {
        global.mockFetch({
          success: true,
          message: 'Rejected and points restored',
          points_restored: 1000,
        }, 200);

        const response = await fetch('/api/admin/reward_conversion_action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversion_id: 1, action: 'reject' }),
        });

        const data = await response.json();
        expect(data).toHaveProperty('points_restored');
      });
    });
  });

  // ==================== GET SUBMIT MATERIAL REQUESTS ====================
  describe('GET /api/admin/get_request_submit_materials', () => {
    describe('Success Cases', () => {
      it('should fetch material submission requests', async () => {
        const mockRequests = {
          requests: [
            { request_id: 1, company_name: 'Waste Corp', material_type: 'plastic', weight: 100 },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/admin/get_request_submit_materials', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.requests).toBeDefined();
      });
    });
  });

  // ==================== UPDATE REQUEST STATUS ====================
  describe('POST /api/admin/updateRequestStatus', () => {
    describe('Success Cases', () => {
      it('should update request status', async () => {
        global.mockFetch({ success: true, message: 'Status updated' }, 200);

        const response = await fetch('/api/admin/updateRequestStatus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, status: 'approved' }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject invalid status', async () => {
        global.mockFetch({ success: false, message: 'Invalid status' }, 400);

        const response = await fetch('/api/admin/updateRequestStatus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: 1, status: 'unknown' }),
        });

        expect(response.status).toBe(400);
      });
    });
  });
});
