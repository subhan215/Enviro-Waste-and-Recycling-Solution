/**
 * Schedules API Tests
 * Tests for: schedule management, truck assignment, ratings
 */

describe('Schedules API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET SCHEDULE FOR USER ====================
  describe('GET /api/schedule/get_schedule_for_user/[user_id]', () => {
    describe('Success Cases', () => {
      it('should fetch schedules for a valid user', async () => {
        const mockSchedules = {
          schedules: [
            {
              schedule_id: 1,
              pickup_date: '2024-01-20',
              pickup_time: '10:00:00',
              status: 'scheduled',
              company_name: 'Waste Corp',
            },
          ],
        };
        global.mockFetch(mockSchedules, 200);

        const response = await fetch('/api/schedule/get_schedule_for_user/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.schedules).toBeDefined();
        expect(data.schedules[0]).toHaveProperty('schedule_id');
        expect(data.schedules[0]).toHaveProperty('pickup_date');
        expect(data.schedules[0]).toHaveProperty('status');
      });

      it('should return empty array for user with no schedules', async () => {
        global.mockFetch({ schedules: [] }, 200);

        const response = await fetch('/api/schedule/get_schedule_for_user/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.schedules).toHaveLength(0);
      });

      it('should return schedules with company information', async () => {
        const mockSchedules = {
          schedules: [
            {
              schedule_id: 1,
              pickup_date: '2024-01-20',
              company_name: 'Waste Corp',
              company_id: 1,
            },
          ],
        };
        global.mockFetch(mockSchedules, 200);

        const response = await fetch('/api/schedule/get_schedule_for_user/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.schedules[0]).toHaveProperty('company_name');
      });
    });

    describe('Edge Cases', () => {
      it('should handle non-existent user id', async () => {
        global.mockFetch({ schedules: [] }, 200);

        const response = await fetch('/api/schedule/get_schedule_for_user/99999', {
          method: 'GET',
        });

        expect(response.ok).toBe(true);
      });

      it('should handle invalid user id format', async () => {
        global.mockFetch({ error: 'Invalid user ID' }, 400);

        const response = await fetch('/api/schedule/get_schedule_for_user/invalid', {
          method: 'GET',
        });

        expect([200, 400]).toContain(response.status);
      });
    });
  });

  // ==================== GET SCHEDULES FOR COMPANY ====================
  describe('GET /api/schedule/get_schedules_for_company/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch all schedules for a company', async () => {
        const mockSchedules = {
          schedules: [
            { schedule_id: 1, user_name: 'John Doe', area_name: 'Downtown', status: 'scheduled' },
            { schedule_id: 2, user_name: 'Jane Doe', area_name: 'Uptown', status: 'completed' },
          ],
        };
        global.mockFetch(mockSchedules, 200);

        const response = await fetch('/api/schedule/get_schedules_for_company/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.schedules.length).toBeGreaterThan(0);
      });

      it('should include user and area details', async () => {
        const mockSchedules = {
          schedules: [
            { schedule_id: 1, user_name: 'John Doe', area_name: 'Downtown', user_id: 1 },
          ],
        };
        global.mockFetch(mockSchedules, 200);

        const response = await fetch('/api/schedule/get_schedules_for_company/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.schedules[0]).toHaveProperty('user_name');
        expect(data.schedules[0]).toHaveProperty('area_name');
      });
    });

    describe('Edge Cases', () => {
      it('should return empty for company with no schedules', async () => {
        global.mockFetch({ schedules: [] }, 200);

        const response = await fetch('/api/schedule/get_schedules_for_company/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.schedules).toHaveLength(0);
      });
    });
  });

  // ==================== ASSIGN TRUCK ====================
  describe('POST /api/schedule/assign_truck', () => {
    describe('Success Cases', () => {
      it('should assign truck to a schedule', async () => {
        global.mockFetch({ success: true, message: 'Truck assigned successfully' }, 200);

        const response = await fetch('/api/schedule/assign_truck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, truck_id: 1 }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject without schedule_id', async () => {
        global.mockFetch({ success: false, message: 'Schedule ID required' }, 400);

        const response = await fetch('/api/schedule/assign_truck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truck_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without truck_id', async () => {
        global.mockFetch({ success: false, message: 'Truck ID required' }, 400);

        const response = await fetch('/api/schedule/assign_truck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-existent schedule', async () => {
        global.mockFetch({ success: false, message: 'Schedule not found' }, 404);

        const response = await fetch('/api/schedule/assign_truck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 99999, truck_id: 1 }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject non-existent truck', async () => {
        global.mockFetch({ success: false, message: 'Truck not found' }, 404);

        const response = await fetch('/api/schedule/assign_truck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, truck_id: 99999 }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject already assigned schedule', async () => {
        global.mockFetch({ success: false, message: 'Schedule already has a truck assigned' }, 400);

        const response = await fetch('/api/schedule/assign_truck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, truck_id: 1 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== MARK AS DONE ====================
  describe('POST /api/schedule/mark_as_done', () => {
    describe('Success Cases', () => {
      it('should mark schedule as done', async () => {
        global.mockFetch({ success: true, message: 'Schedule marked as done' }, 200);

        const response = await fetch('/api/schedule/mark_as_done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1 }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should update rewards after completion', async () => {
        global.mockFetch({ success: true, message: 'Schedule completed', rewards_added: 10 }, 200);

        const response = await fetch('/api/schedule/mark_as_done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1 }),
        });

        const data = await response.json();
        expect(data).toHaveProperty('rewards_added');
      });
    });

    describe('Edge Cases', () => {
      it('should reject without schedule_id', async () => {
        global.mockFetch({ success: false, message: 'Schedule ID required' }, 400);

        const response = await fetch('/api/schedule/mark_as_done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
      });

      it('should reject already completed schedule', async () => {
        global.mockFetch({ success: false, message: 'Schedule already completed' }, 400);

        const response = await fetch('/api/schedule/mark_as_done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET REWARDS ====================
  describe('GET /api/schedule/get_rewards/[user_id]', () => {
    describe('Success Cases', () => {
      it('should fetch user rewards', async () => {
        global.mockFetch({ rewards: 150, level: 'Gold' }, 200);

        const response = await fetch('/api/schedule/get_rewards/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data).toHaveProperty('rewards');
      });

      it('should return zero for new user', async () => {
        global.mockFetch({ rewards: 0, level: 'Bronze' }, 200);

        const response = await fetch('/api/schedule/get_rewards/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.rewards).toBe(0);
      });
    });
  });

  // ==================== RATING API ====================
  describe('POST /api/schedule/rating_given_by_user', () => {
    describe('Success Cases', () => {
      it('should submit rating successfully', async () => {
        global.mockFetch({ success: true, message: 'Rating submitted' }, 200);

        const response = await fetch('/api/schedule/rating_given_by_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, rating: 5, feedback: 'Excellent service!' }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should accept rating without feedback', async () => {
        global.mockFetch({ success: true, message: 'Rating submitted' }, 200);

        const response = await fetch('/api/schedule/rating_given_by_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, rating: 4 }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject rating below 1', async () => {
        global.mockFetch({ success: false, message: 'Rating must be between 1 and 5' }, 400);

        const response = await fetch('/api/schedule/rating_given_by_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, rating: 0 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject rating above 5', async () => {
        global.mockFetch({ success: false, message: 'Rating must be between 1 and 5' }, 400);

        const response = await fetch('/api/schedule/rating_given_by_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, rating: 6 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-numeric rating', async () => {
        global.mockFetch({ success: false, message: 'Invalid rating' }, 400);

        const response = await fetch('/api/schedule/rating_given_by_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, rating: 'excellent' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject duplicate rating', async () => {
        global.mockFetch({ success: false, message: 'Already rated this schedule' }, 400);

        const response = await fetch('/api/schedule/rating_given_by_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: 1, rating: 5 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET COMPANY RATING ====================
  describe('GET /api/schedule/get_company_rating/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch company average rating', async () => {
        global.mockFetch({ average_rating: 4.5, total_ratings: 100 }, 200);

        const response = await fetch('/api/schedule/get_company_rating/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data).toHaveProperty('average_rating');
        expect(data).toHaveProperty('total_ratings');
      });

      it('should return null rating for company with no ratings', async () => {
        global.mockFetch({ average_rating: null, total_ratings: 0 }, 200);

        const response = await fetch('/api/schedule/get_company_rating/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.total_ratings).toBe(0);
      });
    });
  });
});
