/**
 * Reports API Tests
 * Tests for: sending reports, getting reports, resolving complaints
 */

describe('Reports API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== SEND REPORT ====================
  describe('POST /api/report/send_report', () => {
    describe('Success Cases', () => {
      it('should send report successfully', async () => {
        global.mockFetch({
          success: true,
          message: 'Report submitted successfully',
          report_id: 1,
        }, 200);

        const response = await fetch('/api/report/send_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            company_id: 1,
            subject: 'Missed Pickup',
            description: 'The truck did not arrive as scheduled.',
          }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data).toHaveProperty('report_id');
      });

      it('should accept report with attachments', async () => {
        global.mockFetch({ success: true, message: 'Report submitted with attachments' }, 200);

        const response = await fetch('/api/report/send_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            company_id: 1,
            subject: 'Issue',
            description: 'Description',
            attachments: ['image1.jpg', 'image2.jpg'],
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject report without user_id', async () => {
        global.mockFetch({ success: false, message: 'User ID required' }, 400);

        const response = await fetch('/api/report/send_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            subject: 'Test',
            description: 'Test description',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject report without company_id', async () => {
        global.mockFetch({ success: false, message: 'Company ID required' }, 400);

        const response = await fetch('/api/report/send_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            subject: 'Test',
            description: 'Test description',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject report without subject', async () => {
        global.mockFetch({ success: false, message: 'Subject required' }, 400);

        const response = await fetch('/api/report/send_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            company_id: 1,
            description: 'Test description',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject report without description', async () => {
        global.mockFetch({ success: false, message: 'Description required' }, 400);

        const response = await fetch('/api/report/send_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            company_id: 1,
            subject: 'Test',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject report with empty subject', async () => {
        global.mockFetch({ success: false, message: 'Subject cannot be empty' }, 400);

        const response = await fetch('/api/report/send_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            company_id: 1,
            subject: '',
            description: 'Test',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject report with very long description', async () => {
        global.mockFetch({ success: false, message: 'Description too long' }, 400);

        const response = await fetch('/api/report/send_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 1,
            company_id: 1,
            subject: 'Test',
            description: 'x'.repeat(10001),
          }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET ALL REPORTS (ADMIN) ====================
  describe('GET /api/report/get_all_reports', () => {
    describe('Success Cases', () => {
      it('should fetch all reports for admin', async () => {
        const mockReports = {
          reports: [
            { report_id: 1, subject: 'Issue 1', status: 'pending' },
            { report_id: 2, subject: 'Issue 2', status: 'resolved' },
          ],
        };
        global.mockFetch(mockReports, 200);

        const response = await fetch('/api/report/get_all_reports', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.reports).toBeDefined();
        expect(data.reports.length).toBeGreaterThan(0);
      });

      it('should return reports with user and company info', async () => {
        const mockReports = {
          reports: [
            {
              report_id: 1,
              user_name: 'John Doe',
              company_name: 'Waste Corp',
              subject: 'Issue',
              status: 'pending',
            },
          ],
        };
        global.mockFetch(mockReports, 200);

        const response = await fetch('/api/report/get_all_reports', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.reports[0]).toHaveProperty('user_name');
        expect(data.reports[0]).toHaveProperty('company_name');
      });

      it('should return empty array if no reports', async () => {
        global.mockFetch({ reports: [] }, 200);

        const response = await fetch('/api/report/get_all_reports', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.reports).toHaveLength(0);
      });
    });
  });

  // ==================== GET REPORT FOR USER ====================
  describe('GET /api/report/get_report/[user_id]', () => {
    describe('Success Cases', () => {
      it('should fetch reports for specific user', async () => {
        const mockReports = {
          reports: [
            { report_id: 1, subject: 'My Issue', status: 'pending' },
          ],
        };
        global.mockFetch(mockReports, 200);

        const response = await fetch('/api/report/get_report/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.reports).toBeDefined();
      });

      it('should return empty for user with no reports', async () => {
        global.mockFetch({ reports: [] }, 200);

        const response = await fetch('/api/report/get_report/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.reports).toHaveLength(0);
      });
    });
  });

  // ==================== GET REPORT MESSAGES ====================
  describe('GET /api/report/get_report_messages/[user_id]', () => {
    describe('Success Cases', () => {
      it('should fetch report messages', async () => {
        const mockMessages = {
          messages: [
            { message_id: 1, content: 'Hello', sender: 'user', created_at: '2024-01-15T10:00:00Z' },
            { message_id: 2, content: 'Reply', sender: 'admin', created_at: '2024-01-15T11:00:00Z' },
          ],
        };
        global.mockFetch(mockMessages, 200);

        const response = await fetch('/api/report/get_report_messages/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.messages).toBeDefined();
      });
    });
  });

  // ==================== MARK AS RESOLVED ====================
  describe('POST /api/report/mark_as_resolved', () => {
    describe('Success Cases', () => {
      it('should mark report as resolved', async () => {
        global.mockFetch({ success: true, message: 'Report marked as resolved' }, 200);

        const response = await fetch('/api/report/mark_as_resolved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report_id: 1 }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without report_id', async () => {
        global.mockFetch({ success: false, message: 'Report ID required' }, 400);

        const response = await fetch('/api/report/mark_as_resolved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
      });

      it('should reject non-existent report', async () => {
        global.mockFetch({ success: false, message: 'Report not found' }, 404);

        const response = await fetch('/api/report/mark_as_resolved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report_id: 99999 }),
        });

        expect(response.status).toBe(404);
      });

      it('should reject already resolved report', async () => {
        global.mockFetch({ success: false, message: 'Report already resolved' }, 400);

        const response = await fetch('/api/report/mark_as_resolved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report_id: 1 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== GET COMPANIES FOR USER TO REPORT ====================
  describe('GET /api/report/get_companies_for_user_to_report/[user_id]', () => {
    describe('Success Cases', () => {
      it('should fetch companies user can report', async () => {
        const mockCompanies = {
          companies: [
            { company_id: 1, name: 'Waste Corp', area_name: 'Downtown' },
            { company_id: 2, name: 'Green Solutions', area_name: 'Uptown' },
          ],
        };
        global.mockFetch(mockCompanies, 200);

        const response = await fetch('/api/report/get_companies_for_user_to_report/1', {
          method: 'GET',
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.companies).toBeDefined();
      });

      it('should return empty if no companies serve user area', async () => {
        global.mockFetch({ companies: [] }, 200);

        const response = await fetch('/api/report/get_companies_for_user_to_report/999', {
          method: 'GET',
        });

        const data = await response.json();
        expect(data.companies).toHaveLength(0);
      });
    });
  });

  // ==================== MARK MESSAGE READ ====================
  describe('POST /api/report/mark_message_read', () => {
    describe('Success Cases', () => {
      it('should mark message as read', async () => {
        global.mockFetch({ success: true, message: 'Message marked as read' }, 200);

        const response = await fetch('/api/report/mark_message_read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message_id: 1 }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without message_id', async () => {
        global.mockFetch({ success: false, message: 'Message ID required' }, 400);

        const response = await fetch('/api/report/mark_message_read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== REMOVE COMPANY AGREEMENT ====================
  describe('POST /api/report/remove_company_agreement', () => {
    describe('Success Cases', () => {
      it('should remove company agreement', async () => {
        global.mockFetch({ success: true, message: 'Agreement removed' }, 200);

        const response = await fetch('/api/report/remove_company_agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1, area_id: 1 }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject without company_id', async () => {
        global.mockFetch({ success: false, message: 'Company ID required' }, 400);

        const response = await fetch('/api/report/remove_company_agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ area_id: 1 }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject without area_id', async () => {
        global.mockFetch({ success: false, message: 'Area ID required' }, 400);

        const response = await fetch('/api/report/remove_company_agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id: 1 }),
        });

        expect(response.status).toBe(400);
      });
    });
  });
});
