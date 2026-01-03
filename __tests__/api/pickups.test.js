/**
 * Pickups API Tests
 * Tests for: missed pickups, confirmations, completions
 */

describe('Pickups API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== REPORT MISSED PICKUP ====================
  describe('POST /api/pickup/report_missed_pickup', () => {
    describe('Success Cases', () => {
      it('should report missed pickup successfully', async () => {
        global.mockFetch({
          success: true,
          message: 'Missed pickup reported',
          report_id: 1,
        }, 200);

        const response = await fetch('/api/pickup/report_missed_pickup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            schedule_id: 1,
            reason: 'Truck did not arrive',
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should accept report with additional notes', async () => {
        global.mockFetch({ success: true, message: 'Reported' }, 200);

        const response = await fetch('/api/pickup/report_missed_pickup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            schedule_id: 1,
            reason: 'Not arrived',
            notes: 'Waited for 2 hours',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject without user_id', async () => {
        global.mockFetch({ success: false, message: 'User ID required' }, 400);

        const response = await fetch('/api/pickup/report_missed_pickup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, reason: 'Test' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without schedule_id', async () => {
        global.mockFetch({ success: false, message: 'Schedule ID required' }, 400);

        const response = await fetch('/api/pickup/report_missed_pickup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, reason: 'Test' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without reason', async () => {
        global.mockFetch({ success: false, message: 'Reason required' }, 400);

        const response = await fetch('/api/pickup/report_missed_pickup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, schedule_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject for non-existent schedule', async () => {
        global.mockFetch({ success: false, message: 'Schedule not found' }, 404);

        const response = await fetch('/api/pickup/report_missed_pickup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, schedule_id: 99999, reason: 'Test' }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject duplicate report for same schedule', async () => {
        global.mockFetch({ success: false, message: 'Already reported for this schedule' }, 400);

        const response = await fetch('/api/pickup/report_missed_pickup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, schedule_id: 1, reason: 'Test' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject report for completed pickup', async () => {
        global.mockFetch({ success: false, message: 'Cannot report completed pickup' }, 400);

        const response = await fetch('/api/pickup/report_missed_pickup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1, schedule_id: 1, reason: 'Test' }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET MISSED PICKUPS FOR USER ====================
  describe('GET /api/pickup/get_All_missed_pickups_for_user/[id]', () => {
    describe('Success Cases', () => {
      it('should fetch missed pickups for user', async () => {
        const mockPickups = {
          missed_pickups: [
            {
              report_id: 1,
              schedule_id: 1,
              reason: 'Not arrived',
              status: 'pending',
              reported_at: '2024-01-15T10:00:00Z',
            },
          ],
        };
        global.mockFetch(mockPickups, 200);

        const response = await fetch('/api/pickup/get_All_missed_pickups_for_user/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.missed_pickups).toBeDefined();
      });

      it('should return empty for user with no missed pickups', async () => {
        global.mockFetch({ missed_pickups: [] }, 200);

        const response = await fetch('/api/pickup/get_All_missed_pickups_for_user/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.missed_pickups).toHaveLength(0);
      });

      it('should include company information', async () => {
        const mockPickups = {
          missed_pickups: [
            { report_id: 1, company_name: 'Waste Corp', company_id: 1 },
          ],
        };
        global.mockFetch(mockPickups, 200);

        const response = await fetch('/api/pickup/get_All_missed_pickups_for_user/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.missed_pickups[0]).toHaveProperty('company_name');
      });
    });
  });

  // ==================== GET MISSED PICKUPS FOR COMPANY ====================
  describe('GET /api/pickup/get_All_missed_pickups_for_company/[id]', () => {
    describe('Success Cases', () => {
      it('should fetch missed pickups for company', async () => {
        const mockPickups = {
          missed_pickups: [
            { report_id: 1, user_name: 'John Doe', area_name: 'Downtown', status: 'pending' },
          ],
        };
        global.mockFetch(mockPickups, 200);

        const response = await fetch('/api/pickup/get_All_missed_pickups_for_company/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.missed_pickups).toBeDefined();
      });

      it('should include user and area details', async () => {
        const mockPickups = {
          missed_pickups: [
            { report_id: 1, user_name: 'John', user_id: 1, area_name: 'Downtown' },
          ],
        };
        global.mockFetch(mockPickups, 200);

        const response = await fetch('/api/pickup/get_All_missed_pickups_for_company/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.missed_pickups[0]).toHaveProperty('user_name');
        expect(data.missed_pickups[0]).toHaveProperty('area_name');
      });
    });
  });

  // ==================== COMPLETED BY COMPANY ====================
  describe('POST /api/pickup/completed_by_company', () => {
    describe('Success Cases', () => {
      it('should mark pickup as completed by company', async () => {
        global.mockFetch({ success: true, message: 'Marked as completed' }, 200);

        const response = await fetch('/api/pickup/completed_by_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, company_id: 1 }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should add notes with completion', async () => {
        global.mockFetch({ success: true, message: 'Completed with notes' }, 200);

        const response = await fetch('/api/pickup/completed_by_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedule_id: 1,
            company_id: 1,
            notes: 'Collected 2 bags',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without schedule_id', async () => {
        global.mockFetch({ success: false, message: 'Schedule ID required' }, 400);

        const response = await fetch('/api/pickup/completed_by_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject for schedule not belonging to company', async () => {
        global.mockFetch({ success: false, message: 'Unauthorized' }, 403);

        const response = await fetch('/api/pickup/completed_by_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, company_id: 999 }),
        });

        expect(response.status).toBe(403);
      });

      it('should reject already completed schedule', async () => {
        global.mockFetch({ success: false, message: 'Already completed' }, 400);

        const response = await fetch('/api/pickup/completed_by_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, company_id: 1 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== CONFIRMED FROM USER ====================
  describe('POST /api/pickup/confirmed_from_user', () => {
    describe('Success Cases', () => {
      it('should confirm pickup by user', async () => {
        global.mockFetch({ success: true, message: 'Pickup confirmed' }, 200);

        const response = await fetch('/api/pickup/confirmed_from_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, user_id: 1 }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should trigger reward addition after confirmation', async () => {
        global.mockFetch({
          success: true,
          message: 'Confirmed',
          rewards_earned: 10,
        }, 200);

        const response = await fetch('/api/pickup/confirmed_from_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, user_id: 1 }),
        });

        const data = await response.json();
        expect(data).toHaveProperty('rewards_earned');
      });
    });

    describe('Edge Cases', () => {
      it('should reject without schedule_id', async () => {
        global.mockFetch({ success: false, message: 'Schedule ID required' }, 400);

        const response = await fetch('/api/pickup/confirmed_from_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without user_id', async () => {
        global.mockFetch({ success: false, message: 'User ID required' }, 400);

        const response = await fetch('/api/pickup/confirmed_from_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject if schedule not marked completed by company', async () => {
        global.mockFetch({ success: false, message: 'Pickup not completed by company yet' }, 400);

        const response = await fetch('/api/pickup/confirmed_from_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, user_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject for schedule not belonging to user', async () => {
        global.mockFetch({ success: false, message: 'Unauthorized' }, 403);

        const response = await fetch('/api/pickup/confirmed_from_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, user_id: 999 }),
        });

        expect(response.status).toBe(403);
      });

      it('should reject already confirmed pickup', async () => {
        global.mockFetch({ success: false, message: 'Already confirmed' }, 400);

        const response = await fetch('/api/pickup/confirmed_from_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, user_id: 1 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });
});
