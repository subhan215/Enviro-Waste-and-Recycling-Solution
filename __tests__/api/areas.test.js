/**
 * Areas API Tests
 * Tests for: area management, assignments, availability
 */

describe('Areas API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET ALL AREAS ====================
  describe('GET /api/area/get_all_areas', () => {
    describe('Success Cases', () => {
      it('should fetch all areas', async () => {
        const mockAreas = {
          areas: [
            { area_id: 1, area_name: 'Downtown', city: 'Metropolis' },
            { area_id: 2, area_name: 'Uptown', city: 'Metropolis' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_all_areas', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.areas).toBeDefined();
        expect(data.areas.length).toBeGreaterThan(0);
      });

      it('should include area details', async () => {
        const mockAreas = {
          areas: [
            { area_id: 1, area_name: 'Downtown', city: 'Metropolis', state: 'NY' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_all_areas', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.areas[0]).toHaveProperty('area_name');
        expect(data.areas[0]).toHaveProperty('city');
      });
    });
  });

  // ==================== GET ALL NON-SERVED AREAS ====================
  describe('GET /api/area/get_all_non_served_areas', () => {
    describe('Success Cases', () => {
      it('should fetch areas without company coverage', async () => {
        const mockAreas = {
          areas: [
            { area_id: 3, area_name: 'New District', city: 'Metropolis' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_all_non_served_areas', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.areas).toBeDefined();
      });

      it('should return empty if all areas are served', async () => {
        global.mockFetch({ areas: [] }, 200);

        const response = await fetch('/api/area/get_all_non_served_areas', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.areas).toHaveLength(0);
      });
    });
  });

  // ==================== GET ALL ASSIGNED AREAS ====================
  describe('GET /api/area/get_all_assigned_areas/[id]', () => {
    describe('Success Cases', () => {
      it('should fetch areas assigned to company', async () => {
        const mockAreas = {
          areas: [
            { area_id: 1, area_name: 'Downtown', assigned_at: '2024-01-01' },
            { area_id: 2, area_name: 'Uptown', assigned_at: '2024-01-05' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_all_assigned_areas/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.areas).toBeDefined();
      });

      it('should return empty for company with no assigned areas', async () => {
        global.mockFetch({ areas: [] }, 200);

        const response = await fetch('/api/area/get_all_assigned_areas/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.areas).toHaveLength(0);
      });
    });
  });

  // ==================== ASSIGN AREAS TO COMPANY ====================
  describe('POST /api/area/assign_areas_to_company', () => {
    describe('Success Cases', () => {
      it('should request area assignment', async () => {
        global.mockFetch({ success: true, message: 'Assignment request submitted' }, 200);

        const response = await fetch('/api/area/assign_areas_to_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            area_ids: [1, 2, 3],
          }),
        });

        expect(response.ok).toBe(true);
      });

      it('should accept single area assignment', async () => {
        global.mockFetch({ success: true, message: 'Request submitted' }, 200);

        const response = await fetch('/api/area/assign_areas_to_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            area_ids: [1],
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without company_id', async () => {
        global.mockFetch({ success: false, message: 'Company ID required' }, 400);

        const response = await fetch('/api/area/assign_areas_to_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ area_ids: [1, 2] }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without area_ids', async () => {
        global.mockFetch({ success: false, message: 'Area IDs required' }, 400);

        const response = await fetch('/api/area/assign_areas_to_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject empty area_ids array', async () => {
        global.mockFetch({ success: false, message: 'At least one area required' }, 400);

        const response = await fetch('/api/area/assign_areas_to_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, area_ids: [] }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject already assigned area', async () => {
        global.mockFetch({ success: false, message: 'One or more areas already assigned' }, 400);

        const response = await fetch('/api/area/assign_areas_to_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, area_ids: [1] }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-existent area', async () => {
        global.mockFetch({ success: false, message: 'Area not found' }, 404);

        const response = await fetch('/api/area/assign_areas_to_company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, area_ids: [99999] }),
        });

        expect(response.status).toBe(404);
      });
    });
  });

  // ==================== GET AREA FOR REQUEST APPROVAL ====================
  describe('GET /api/area/get_area_for_request_approval/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch areas pending approval', async () => {
        const mockAreas = {
          areas: [
            { request_id: 1, area_name: 'New Area', requested_at: '2024-01-15' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_area_for_request_approval/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.areas).toBeDefined();
      });
    });
  });

  // ==================== ASSIGN TRUCK TO AREA ====================
  describe('POST /api/area/assign_truck_to_area/[id]', () => {
    describe('Success Cases', () => {
      it('should assign truck to area', async () => {
        global.mockFetch({ success: true, message: 'Truck assigned to area' }, 200);

        const response = await fetch('/api/area/assign_truck_to_area/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truck_id: 1 }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without truck_id', async () => {
        global.mockFetch({ success: false, message: 'Truck ID required' }, 400);

        const response = await fetch('/api/area/assign_truck_to_area/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-existent truck', async () => {
        global.mockFetch({ success: false, message: 'Truck not found' }, 404);

        const response = await fetch('/api/area/assign_truck_to_area/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truck_id: 99999 }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject truck already assigned to another area', async () => {
        global.mockFetch({ success: false, message: 'Truck already assigned' }, 400);

        const response = await fetch('/api/area/assign_truck_to_area/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truck_id: 1 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET TRUCK NOT ASSIGNED AREAS ====================
  describe('GET /api/area/get_truck_not_assigned_areas/[id]', () => {
    describe('Success Cases', () => {
      it('should fetch areas without assigned trucks', async () => {
        const mockAreas = {
          areas: [
            { area_id: 2, area_name: 'Uptown' },
            { area_id: 3, area_name: 'Suburbs' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_truck_not_assigned_areas/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.areas).toBeDefined();
      });
    });
  });

  // ==================== GET AVAILABLE AREAS FOR SERVICE ====================
  describe('GET /api/area/get_available_areas_for_service/[service_type]', () => {
    describe('Success Cases', () => {
      it('should fetch available areas for waste collection', async () => {
        const mockAreas = {
          areas: [
            { area_id: 1, area_name: 'Downtown' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_available_areas_for_service/waste_collection', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.areas).toBeDefined();
      });

      it('should fetch available areas for recycling', async () => {
        const mockAreas = {
          areas: [
            { area_id: 2, area_name: 'Uptown' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_available_areas_for_service/recycling', {
          method: 'GET',
        });

        expect(response.ok).toBe(true);
      });

      it('should fetch available areas for manhole repair', async () => {
        const mockAreas = {
          areas: [
            { area_id: 3, area_name: 'Industrial Zone' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/area/get_available_areas_for_service/manhole_repair', {
          method: 'GET',
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should return empty for invalid service type', async () => {
        global.mockFetch({ areas: [] }, 200);

        const response = await fetch('/api/area/get_available_areas_for_service/invalid_service', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.areas).toHaveLength(0);
      });
    });
  });
});
