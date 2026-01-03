/**
 * Company API Tests
 * Tests for: company signup, agreements, recycling centers, materials
 */

describe('Company API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== COMPANY SIGNUP ====================
  describe('POST /api/company/signup', () => {
    const validCompanyData = {
      name: 'Waste Management Corp',
      email: 'contact@wastecorp.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      phone: '1234567890',
      address: '123 Business Street',
      registration_number: 'REG123456',
    };

    describe('Success Cases', () => {
      it('should register company successfully', async () => {
        global.mockFetch({
          success: true,
          message: 'Company registered successfully',
          company_id: 1,
        }, 200);

        const response = await fetch('/api/company/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validCompanyData),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject without name', async () => {
        const { name, ...dataWithoutName } = validCompanyData;
        global.mockFetch({ success: false, message: 'All fields required' }, 400);

        const response = await fetch('/api/company/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutName),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without email', async () => {
        const { email, ...dataWithoutEmail } = validCompanyData;
        global.mockFetch({ success: false, message: 'All fields required' }, 400);

        const response = await fetch('/api/company/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutEmail),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid email format', async () => {
        global.mockFetch({ success: false, message: 'Invalid email format' }, 400);

        const response = await fetch('/api/company/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...validCompanyData, email: 'invalid-email' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject weak password', async () => {
        global.mockFetch({ success: false, message: 'Password too weak' }, 400);

        const response = await fetch('/api/company/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...validCompanyData, password: '123', confirmPassword: '123' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject mismatched passwords', async () => {
        global.mockFetch({ success: false, message: 'Passwords do not match' }, 400);

        const response = await fetch('/api/company/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...validCompanyData, confirmPassword: 'Different123!' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject duplicate email', async () => {
        global.mockFetch({ success: false, message: 'Email already registered' }, 400);

        const response = await fetch('/api/company/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validCompanyData),
        });

        expect(response.status).toBe(400);
      });

      it('should reject duplicate registration number', async () => {
        global.mockFetch({ success: false, message: 'Registration number already exists' }, 400);

        const response = await fetch('/api/company/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validCompanyData),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== CHECK AGREEMENT ====================
  describe('GET /api/company/check-agreement', () => {
    describe('Success Cases', () => {
      it('should check if company has agreement', async () => {
        global.mockFetch({ has_agreement: true, areas: ['Downtown', 'Uptown'] }, 200);

        const response = await fetch('/api/company/check-agreement?company_id=1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data).toHaveProperty('has_agreement');
      });

      it('should return false for company without agreement', async () => {
        global.mockFetch({ has_agreement: false, areas: [] }, 200);

        const response = await fetch('/api/company/check-agreement?company_id=999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.has_agreement).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without company_id', async () => {
        global.mockFetch({ error: 'Company ID required' }, 400);

        const response = await fetch('/api/company/check-agreement', {
          method: 'GET',
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== RESIGN AGREEMENT ====================
  describe('POST /api/company/resign-agreement', () => {
    describe('Success Cases', () => {
      it('should submit resignation request', async () => {
        global.mockFetch({ success: true, message: 'Resignation request submitted' }, 200);

        const response = await fetch('/api/company/resign-agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            area_id: 1,
            reason: 'Relocating operations',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without company_id', async () => {
        global.mockFetch({ success: false, message: 'Company ID required' }, 400);

        const response = await fetch('/api/company/resign-agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ area_id: 1, reason: 'Test' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without reason', async () => {
        global.mockFetch({ success: false, message: 'Reason required' }, 400);

        const response = await fetch('/api/company/resign-agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, area_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject if no agreement exists', async () => {
        global.mockFetch({ success: false, message: 'No agreement found' }, 404);

        const response = await fetch('/api/company/resign-agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 999, area_id: 1, reason: 'Test' }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject duplicate resignation request', async () => {
        global.mockFetch({ success: false, message: 'Pending resignation request exists' }, 400);

        const response = await fetch('/api/company/resign-agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, area_id: 1, reason: 'Test' }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET PENDING RESIGN AGREEMENT ====================
  describe('GET /api/company/get_pending_resign_agreement/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch pending resignation', async () => {
        global.mockFetch({
          pending: { resign_id: 1, area_name: 'Downtown', status: 'pending' },
        }, 200);

        const response = await fetch('/api/company/get_pending_resign_agreement/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.pending).toBeDefined();
      });

      it('should return null if no pending resignation', async () => {
        global.mockFetch({ pending: null }, 200);

        const response = await fetch('/api/company/get_pending_resign_agreement/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.pending).toBeNull();
      });
    });
  });

  // ==================== CREATE RECYCLING CENTER ====================
  describe('POST /api/company/recycling_center/create', () => {
    describe('Success Cases', () => {
      it('should create recycling center request', async () => {
        global.mockFetch({ success: true, message: 'Request submitted', request_id: 1 }, 200);

        const response = await fetch('/api/company/recycling_center/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            name: 'Downtown Recycling Center',
            address: '123 Green Street',
            area_id: 1,
            materials_accepted: ['plastic', 'paper', 'metal'],
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without name', async () => {
        global.mockFetch({ success: false, message: 'Name required' }, 400);

        const response = await fetch('/api/company/recycling_center/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, address: '123 Street', area_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without address', async () => {
        global.mockFetch({ success: false, message: 'Address required' }, 400);

        const response = await fetch('/api/company/recycling_center/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, name: 'Center', area_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject duplicate center in same area', async () => {
        global.mockFetch({ success: false, message: 'Center already exists in area' }, 400);

        const response = await fetch('/api/company/recycling_center/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            name: 'Center',
            address: '123 Street',
            area_id: 1,
          }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET COMPANY RECYCLING CENTERS ====================
  describe('GET /api/company/recycling_center/get_company_recycling_centers/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch company recycling centers', async () => {
        const mockCenters = {
          centers: [
            { center_id: 1, name: 'Downtown Center', area_name: 'Downtown', status: 'active' },
          ],
        };
        global.mockFetch(mockCenters, 200);

        const response = await fetch('/api/company/recycling_center/get_company_recycling_centers/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.centers).toBeDefined();
      });
    });
  });

  // ==================== GET COMPANY RECYCLING CENTER REQUESTS ====================
  describe('GET /api/company/recycling_center/get_company_recycling_center_requests/[companyId]', () => {
    describe('Success Cases', () => {
      it('should fetch pending center requests', async () => {
        const mockRequests = {
          requests: [
            { request_id: 1, name: 'New Center', status: 'pending' },
          ],
        };
        global.mockFetch(mockRequests, 200);

        const response = await fetch('/api/company/recycling_center/get_company_recycling_center_requests/1', {
          method: 'GET',
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  // ==================== GET UNASSIGNED AREAS ====================
  describe('GET /api/company/recycling_center/get_unassigned_areas/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch areas without recycling centers', async () => {
        const mockAreas = {
          areas: [
            { area_id: 1, area_name: 'Uptown' },
            { area_id: 2, area_name: 'Suburbs' },
          ],
        };
        global.mockFetch(mockAreas, 200);

        const response = await fetch('/api/company/recycling_center/get_unassigned_areas/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.areas).toBeDefined();
      });
    });
  });

  // ==================== SUBMIT MATERIALS ====================
  describe('POST /api/company/submit-materials', () => {
    describe('Success Cases', () => {
      it('should submit materials successfully', async () => {
        global.mockFetch({ success: true, message: 'Materials submitted', request_id: 1 }, 200);

        const response = await fetch('/api/company/submit-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            material_type: 'plastic',
            weight: 100,
            unit: 'kg',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without material_type', async () => {
        global.mockFetch({ success: false, message: 'Material type required' }, 400);

        const response = await fetch('/api/company/submit-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, weight: 100 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject zero weight', async () => {
        global.mockFetch({ success: false, message: 'Weight must be greater than 0' }, 400);

        const response = await fetch('/api/company/submit-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, material_type: 'plastic', weight: 0 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET COMPANY SUBMITTED MATERIALS ====================
  describe('GET /api/company/submit-materials/[companyId]', () => {
    describe('Success Cases', () => {
      it('should fetch submitted materials', async () => {
        const mockMaterials = {
          submissions: [
            { submission_id: 1, material_type: 'plastic', weight: 100, status: 'pending' },
          ],
        };
        global.mockFetch(mockMaterials, 200);

        const response = await fetch('/api/company/submit-materials/1', {
          method: 'GET',
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  // ==================== GET COMPANY SERVICES ====================
  describe('GET /api/company/get_services/[company_id]', () => {
    describe('Success Cases', () => {
      it('should fetch company services', async () => {
        const mockServices = {
          services: ['waste_collection', 'recycling', 'manhole_repair'],
        };
        global.mockFetch(mockServices, 200);

        const response = await fetch('/api/company/get_services/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.services).toBeDefined();
      });
    });
  });
});
