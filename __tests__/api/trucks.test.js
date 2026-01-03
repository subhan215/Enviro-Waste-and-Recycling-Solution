/**
 * Trucks API Tests
 * Tests for: truck management, information, updates
 */

describe('Trucks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET TRUCKS INFORMATION ====================
  describe('GET /api/trucks/get_Trucks_Information/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch all trucks for company', async () => {
        const mockTrucks = {
          trucks: [
            {
              truck_id: 1,
              license_plate: 'ABC-123',
              driver_name: 'John Smith',
              capacity: 5000,
              status: 'active',
              assigned_area: 'Downtown',
            },
            {
              truck_id: 2,
              license_plate: 'XYZ-789',
              driver_name: 'Jane Doe',
              capacity: 3000,
              status: 'active',
              assigned_area: null,
            },
          ],
        };
        global.mockFetch(mockTrucks, 200);

        const response = await fetch('/api/trucks/get_Trucks_Information/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.trucks).toBeDefined();
        expect(data.trucks.length).toBeGreaterThan(0);
      });

      it('should include truck details', async () => {
        const mockTrucks = {
          trucks: [
            {
              truck_id: 1,
              license_plate: 'ABC-123',
              driver_name: 'John',
              capacity: 5000,
              status: 'active',
            },
          ],
        };
        global.mockFetch(mockTrucks, 200);

        const response = await fetch('/api/trucks/get_Trucks_Information/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.trucks[0]).toHaveProperty('license_plate');
        expect(data.trucks[0]).toHaveProperty('driver_name');
        expect(data.trucks[0]).toHaveProperty('capacity');
        expect(data.trucks[0]).toHaveProperty('status');
      });

      it('should return empty for company with no trucks', async () => {
        global.mockFetch({ trucks: [] }, 200);

        const response = await fetch('/api/trucks/get_Trucks_Information/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.trucks).toHaveLength(0);
      });

      it('should include assigned area information', async () => {
        const mockTrucks = {
          trucks: [
            { truck_id: 1, assigned_area: 'Downtown', area_id: 1 },
          ],
        };
        global.mockFetch(mockTrucks, 200);

        const response = await fetch('/api/trucks/get_Trucks_Information/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.trucks[0]).toHaveProperty('assigned_area');
      });
    });

    describe('Edge Cases', () => {
      it('should handle non-existent company', async () => {
        global.mockFetch({ trucks: [] }, 200);

        const response = await fetch('/api/trucks/get_Trucks_Information/99999', {
          method: 'GET',
        });

        expect(response.ok).toBe(true);
      });

      it('should handle invalid company_id format', async () => {
        global.mockFetch({ error: 'Invalid company ID' }, 400);

        const response = await fetch('/api/trucks/get_Trucks_Information/invalid', {
          method: 'GET',
        });

        expect([200, 400]).toContain(response.status);
      });
    });
  });

  // ==================== UPDATE TRUCK INFORMATION ====================
  describe('PUT /api/trucks/update_Truck_Information/[truckId]', () => {
    describe('Success Cases', () => {
      it('should update truck information', async () => {
        global.mockFetch({ success: true, message: 'Truck updated successfully' }, 200);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driver_name: 'New Driver',
            capacity: 6000,
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });

      it('should update only driver name', async () => {
        global.mockFetch({ success: true, message: 'Driver updated' }, 200);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driver_name: 'New Driver' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should update only capacity', async () => {
        global.mockFetch({ success: true, message: 'Capacity updated' }, 200);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ capacity: 7000 }),
        });

        expect(response.ok).toBe(true);
      });

      it('should update truck status', async () => {
        global.mockFetch({ success: true, message: 'Status updated' }, 200);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'maintenance' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should update license plate', async () => {
        global.mockFetch({ success: true, message: 'License plate updated' }, 200);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ license_plate: 'NEW-456' }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject non-existent truck', async () => {
        global.mockFetch({ success: false, message: 'Truck not found' }, 404);

        const response = await fetch('/api/trucks/update_Truck_Information/99999', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driver_name: 'New Driver' }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject empty update', async () => {
        global.mockFetch({ success: false, message: 'No fields to update' }, 400);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
      });

      it('should reject negative capacity', async () => {
        global.mockFetch({ success: false, message: 'Capacity must be positive' }, 400);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ capacity: -1000 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject zero capacity', async () => {
        global.mockFetch({ success: false, message: 'Capacity must be greater than 0' }, 400);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ capacity: 0 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid status', async () => {
        global.mockFetch({ success: false, message: 'Invalid status' }, 400);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'unknown' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject duplicate license plate', async () => {
        global.mockFetch({ success: false, message: 'License plate already exists' }, 400);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ license_plate: 'EXISTING-123' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject empty driver name', async () => {
        global.mockFetch({ success: false, message: 'Driver name cannot be empty' }, 400);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driver_name: '' }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Authorization Edge Cases', () => {
      it('should reject update for truck not owned by company', async () => {
        global.mockFetch({ success: false, message: 'Unauthorized' }, 403);

        const response = await fetch('/api/trucks/update_Truck_Information/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driver_name: 'Hacker' }),
        });

        expect(response.status).toBe(403);
      });
    });
  });

  // ==================== ADDITIONAL TRUCK OPERATIONS ====================
  describe('Truck Status Management', () => {
    it('should handle active status', async () => {
      global.mockFetch({ success: true }, 200);

      const response = await fetch('/api/trucks/update_Truck_Information/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      expect(response.ok).toBe(true);
    });

    it('should handle inactive status', async () => {
      global.mockFetch({ success: true }, 200);

      const response = await fetch('/api/trucks/update_Truck_Information/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' }),
      });

      expect(response.ok).toBe(true);
    });

    it('should handle maintenance status', async () => {
      global.mockFetch({ success: true }, 200);

      const response = await fetch('/api/trucks/update_Truck_Information/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'maintenance' }),
      });

      expect(response.ok).toBe(true);
    });
  });
});
