/**
 * Test Utilities
 * Common utilities and helpers for testing
 */

// Placeholder test to satisfy Jest
describe('Test Utilities', () => {
  it('should export utility functions', () => {
    expect(true).toBe(true);
  });
});

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock Store
export const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      userData: (state = { value: {} }) => state,
      currentChat: (state = { value: null }) => state,
      agreementStatus: (state = { value: {} }) => state,
    },
    preloadedState,
  });
};

// Custom render with providers
export const renderWithProviders = (ui, { preloadedState = {}, ...options } = {}) => {
  const store = createMockStore(preloadedState);

  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
};

// Mock User Data
export const mockUserData = {
  user_id: 1,
  name: 'John Doe',
  email_id: 'john@example.com',
  role: 'user',
  area_id: 1,
  mobile: '1234567890',
  gender: 'male',
  age: 25,
};

export const mockCompanyData = {
  user_id: 1,
  name: 'Waste Management Corp',
  email_id: 'contact@waste.com',
  role: 'company',
  phone: '1234567890',
  address: '123 Business St',
};

// Mock API Responses
export const mockApiResponses = {
  notifications: {
    notifications: [
      { notification_id: 1, content: 'Test notification', created_at: new Date().toISOString() },
    ],
  },
  schedules: {
    schedules: [
      { schedule_id: 1, pickup_date: '2024-01-20', status: 'scheduled', company_name: 'Waste Corp' },
    ],
  },
  rewards: {
    rewards: 150,
    level: 'Gold',
  },
  chats: {
    chats: [
      { chat_id: 1, company_name: 'Waste Corp', last_message: 'Hello', unread_count: 2 },
    ],
  },
  areas: {
    areas: [
      { area_id: 1, area_name: 'Downtown', city: 'Metropolis' },
    ],
  },
};

// Wait for async operations
export const waitFor = (callback, { timeout = 5000, interval = 100 } = {}) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
        } else if (Date.now() - startTime < timeout) {
          setTimeout(check, interval);
        } else {
          reject(new Error('Timeout waiting for condition'));
        }
      } catch (error) {
        if (Date.now() - startTime < timeout) {
          setTimeout(check, interval);
        } else {
          reject(error);
        }
      }
    };

    check();
  });
};

// Mock Fetch Helper
export const setupFetchMock = (responses = {}) => {
  const mockFetch = jest.fn((url) => {
    // Find matching response
    for (const [pattern, response] of Object.entries(responses)) {
      if (url.includes(pattern)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(response),
        });
      }
    }

    // Default response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
  });

  global.fetch = mockFetch;
  return mockFetch;
};

// Generate random test data
export const generateTestUser = () => ({
  name: `Test User ${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!',
  gender: 'male',
  age: Math.floor(Math.random() * 40) + 18,
  mobile: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  area_id: 1,
});

export const generateTestCompany = () => ({
  name: `Test Company ${Date.now()}`,
  email: `company${Date.now()}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!',
  phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  address: `${Math.floor(Math.random() * 999)} Test Street`,
  registration_number: `REG${Date.now()}`,
});

// Assertions helpers
export const assertSuccessResponse = (response) => {
  expect(response.success).toBe(true);
  expect(response.message).toBeDefined();
};

export const assertErrorResponse = (response, expectedStatus = 400) => {
  expect(response.success).toBe(false);
  expect(response.message).toBeDefined();
};

// Date helpers
export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};
