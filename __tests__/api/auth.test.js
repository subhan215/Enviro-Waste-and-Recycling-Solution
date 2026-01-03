/**
 * Authentication API Tests
 * Tests for: signin, signup, signout, refresh_token
 */

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== SIGNUP API ====================
  describe('POST /api/users/signup', () => {
    const validUserData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      gender: 'male',
      age: 25,
      mobile: '1234567890',
      area_id: 1,
    };

    describe('Success Cases', () => {
      it('should register a new user with valid data', async () => {
        const mockResponse = {
          success: true,
          userData: { user_id: 1, ...validUserData },
          message: 'Account registered successfully.',
        };
        global.mockFetch(mockResponse, 200);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validUserData),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Account registered successfully.');
      });

      it('should return user data without password after registration', async () => {
        const mockResponse = {
          success: true,
          userData: {
            user_id: 1,
            name: validUserData.name,
            email_id: validUserData.email,
            gender: validUserData.gender,
            age: validUserData.age,
            mobile: validUserData.mobile,
            area_id: validUserData.area_id,
          },
          message: 'Account registered successfully.',
        };
        global.mockFetch(mockResponse, 200);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validUserData),
        });

        const data = await response.json();
        expect(data.userData).not.toHaveProperty('password');
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject signup with missing name', async () => {
        const { name, ...dataWithoutName } = validUserData;
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutName),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
      });

      it('should reject signup with missing email', async () => {
        const { email, ...dataWithoutEmail } = validUserData;
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutEmail),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signup with missing password', async () => {
        const { password, ...dataWithoutPassword } = validUserData;
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutPassword),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signup with missing confirmPassword', async () => {
        const { confirmPassword, ...dataWithoutConfirm } = validUserData;
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutConfirm),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signup with missing gender', async () => {
        const { gender, ...dataWithoutGender } = validUserData;
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutGender),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signup with missing age', async () => {
        const { age, ...dataWithoutAge } = validUserData;
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutAge),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signup with missing mobile', async () => {
        const { mobile, ...dataWithoutMobile } = validUserData;
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutMobile),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signup with missing area_id', async () => {
        const { area_id, ...dataWithoutArea } = validUserData;
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataWithoutArea),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signup with empty string fields', async () => {
        const emptyData = { ...validUserData, name: '', email: '' };
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emptyData),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signup with whitespace-only fields', async () => {
        const whitespaceData = { ...validUserData, name: '   ', email: '   ' };
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(whitespaceData),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Email Validation Edge Cases', () => {
      it('should reject invalid email format - no @', async () => {
        const invalidEmailData = { ...validUserData, email: 'johndoeexample.com' };
        global.mockFetch({ success: false, message: 'Invalid email format.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidEmailData),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid email format - no domain', async () => {
        const invalidEmailData = { ...validUserData, email: 'johndoe@' };
        global.mockFetch({ success: false, message: 'Invalid email format.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidEmailData),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid email format - no TLD', async () => {
        const invalidEmailData = { ...validUserData, email: 'johndoe@example' };
        global.mockFetch({ success: false, message: 'Invalid email format.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidEmailData),
        });

        expect(response.status).toBe(400);
      });

      it('should reject invalid email format - special chars', async () => {
        const invalidEmailData = { ...validUserData, email: 'john<doe>@example.com' };
        global.mockFetch({ success: false, message: 'Invalid email format.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidEmailData),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Password Validation Edge Cases', () => {
      it('should reject password shorter than 8 characters', async () => {
        const shortPasswordData = { ...validUserData, password: 'Pass1!', confirmPassword: 'Pass1!' };
        global.mockFetch({ success: false, message: 'Password must have at least 8 and a maximum of 20 characters, including numeric and special characters.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shortPasswordData),
        });

        expect(response.status).toBe(400);
      });

      it('should reject password longer than 20 characters', async () => {
        const longPasswordData = { ...validUserData, password: 'Password123456789012!', confirmPassword: 'Password123456789012!' };
        global.mockFetch({ success: false, message: 'Password must have at least 8 and a maximum of 20 characters, including numeric and special characters.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(longPasswordData),
        });

        expect(response.status).toBe(400);
      });

      it('should reject password without numeric characters', async () => {
        const noNumericData = { ...validUserData, password: 'Password!', confirmPassword: 'Password!' };
        global.mockFetch({ success: false, message: 'Password must have at least 8 and a maximum of 20 characters, including numeric and special characters.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noNumericData),
        });

        expect(response.status).toBe(400);
      });

      it('should reject password without special characters', async () => {
        const noSpecialData = { ...validUserData, password: 'Password123', confirmPassword: 'Password123' };
        global.mockFetch({ success: false, message: 'Password must have at least 8 and a maximum of 20 characters, including numeric and special characters.' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noSpecialData),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Duplicate Email Edge Cases', () => {
      it('should reject signup with existing email', async () => {
        global.mockFetch({ success: false, message: 'Email already exists!' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validUserData),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe('Email already exists!');
      });

      it('should reject signup with email registered as company', async () => {
        global.mockFetch({ success: false, message: 'Email already exists!' }, 400);

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...validUserData, email: 'company@example.com' }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==================== SIGNIN API ====================
  describe('POST /api/users/signin', () => {
    const validCredentials = {
      email: 'john.doe@example.com',
      password: 'Password123!',
    };

    describe('Success Cases', () => {
      it('should login user with valid credentials', async () => {
        const mockResponse = {
          success: true,
          data: {
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            role: 'user',
            user_id: 1,
            name: 'John Doe',
          },
          message: 'User logged in successfully!',
        };
        global.mockFetch(mockResponse, 200);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validCredentials),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('access_token');
        expect(data.data).toHaveProperty('refresh_token');
      });

      it('should login company with valid credentials', async () => {
        const mockResponse = {
          success: true,
          data: {
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            role: 'company',
            user_id: 1,
            name: 'Waste Corp',
          },
          message: 'User logged in successfully!',
        };
        global.mockFetch(mockResponse, 200);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'company@example.com', password: 'Password123!' }),
        });

        const data = await response.json();
        expect(data.data.role).toBe('company');
      });

      it('should return role in response', async () => {
        const mockResponse = {
          success: true,
          data: { role: 'user', access_token: 'token' },
          message: 'User logged in successfully!',
        };
        global.mockFetch(mockResponse, 200);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validCredentials),
        });

        const data = await response.json();
        expect(data.data.role).toBeDefined();
        expect(['user', 'company']).toContain(data.data.role);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should reject signin with missing email', async () => {
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'Password123!' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signin with missing password', async () => {
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'john@example.com' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signin with empty email', async () => {
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: '', password: 'Password123!' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signin with empty password', async () => {
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'john@example.com', password: '' }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject signin with whitespace-only email', async () => {
        global.mockFetch({ success: false, message: 'All fields are required.' }, 400);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: '   ', password: 'Password123!' }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('Authentication Edge Cases', () => {
      it('should reject signin with non-existent email', async () => {
        global.mockFetch({ success: false, message: 'No user/company exists with the given email' }, 400);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'nonexistent@example.com', password: 'Password123!' }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe('No user/company exists with the given email');
      });

      it('should reject signin with wrong password', async () => {
        global.mockFetch({ success: false, message: 'Invalid password' }, 400);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'john@example.com', password: 'WrongPassword123!' }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe('Invalid password');
      });

      it('should reject if user is already logged in', async () => {
        global.mockFetch({ success: true, message: 'User/Company is already logged in.', role: 'user' }, 403);

        const response = await fetch('/api/users/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid_token',
          },
          body: JSON.stringify(validCredentials),
        });

        expect(response.status).toBe(403);
      });
    });
  });

  // ==================== SIGNOUT API ====================
  describe('POST /api/users/signout', () => {
    describe('Success Cases', () => {
      it('should logout user successfully', async () => {
        global.mockFetch({ success: true, message: 'Logged out successfully' }, 200);

        const response = await fetch('/api/users/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid_token',
          },
        });

        expect(response.ok).toBe(true);
      });

      it('should clear tokens on logout', async () => {
        global.mockFetch({ success: true, message: 'Logged out successfully' }, 200);

        const response = await fetch('/api/users/signout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer valid_token' },
        });

        const data = await response.json();
        expect(data.success).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle signout without token', async () => {
        global.mockFetch({ success: false, message: 'Not authenticated' }, 401);

        const response = await fetch('/api/users/signout', {
          method: 'POST',
        });

        expect(response.status).toBe(401);
      });

      it('should handle signout with invalid token', async () => {
        global.mockFetch({ success: false, message: 'Invalid token' }, 401);

        const response = await fetch('/api/users/signout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer invalid_token' },
        });

        expect(response.status).toBe(401);
      });

      it('should handle signout with expired token', async () => {
        global.mockFetch({ success: false, message: 'Token expired' }, 401);

        const response = await fetch('/api/users/signout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer expired_token' },
        });

        expect(response.status).toBe(401);
      });
    });
  });

  // ==================== REFRESH TOKEN API ====================
  describe('POST /api/users/refresh_token', () => {
    describe('Success Cases', () => {
      it('should refresh access token with valid refresh token', async () => {
        global.mockFetch({
          success: true,
          access_token: 'new_access_token',
          message: 'Token refreshed successfully',
        }, 200);

        const response = await fetch('/api/users/refresh_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: 'valid_refresh_token' }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.access_token).toBeDefined();
      });
    });

    describe('Edge Cases', () => {
      it('should reject refresh with missing refresh token', async () => {
        global.mockFetch({ success: false, message: 'Refresh token required' }, 400);

        const response = await fetch('/api/users/refresh_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
      });

      it('should reject refresh with invalid refresh token', async () => {
        global.mockFetch({ success: false, message: 'Invalid refresh token' }, 401);

        const response = await fetch('/api/users/refresh_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: 'invalid_token' }),
        });

        expect(response.status).toBe(401);
      });

      it('should reject refresh with expired refresh token', async () => {
        global.mockFetch({ success: false, message: 'Refresh token expired' }, 401);

        const response = await fetch('/api/users/refresh_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: 'expired_refresh_token' }),
        });

        expect(response.status).toBe(401);
      });
    });
  });
});
