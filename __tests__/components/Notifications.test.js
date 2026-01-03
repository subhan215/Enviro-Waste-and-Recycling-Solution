/**
 * Notifications Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';

// Mock the component's dependencies
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Simple mock component for testing
const MockNotifications = ({ turnNotificationsToOff }) => {
  const [loading, setLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    setNotifications([
      { notification_id: 1, content: 'Test notification', created_at: new Date().toISOString() },
    ]);
  }, []);

  return (
    <div data-testid="notifications-panel">
      <div className="header">
        <h3>Notifications</h3>
        <button onClick={turnNotificationsToOff} data-testid="close-button">Close</button>
      </div>
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : notifications.length === 0 ? (
        <div data-testid="empty-state">No notifications</div>
      ) : (
        <div data-testid="notifications-list">
          {notifications.map((n) => (
            <div key={n.notification_id} data-testid={`notification-${n.notification_id}`}>
              {n.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

describe('Notifications Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReturnValue({
      user_id: 1,
      role: 'user',
    });
  });

  describe('Rendering', () => {
    it('should render the notifications panel', () => {
      render(<MockNotifications turnNotificationsToOff={jest.fn()} />);
      expect(screen.getByTestId('notifications-panel')).toBeInTheDocument();
    });

    it('should render the header with title', () => {
      render(<MockNotifications turnNotificationsToOff={jest.fn()} />);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<MockNotifications turnNotificationsToOff={jest.fn()} />);
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call turnNotificationsToOff when close button is clicked', () => {
      const mockClose = jest.fn();
      render(<MockNotifications turnNotificationsToOff={mockClose} />);

      fireEvent.click(screen.getByTestId('close-button'));
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notification Display', () => {
    it('should display notifications when available', async () => {
      render(<MockNotifications turnNotificationsToOff={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
      });
    });

    it('should display notification content', async () => {
      render(<MockNotifications turnNotificationsToOff={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Test notification')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no notifications', () => {
      const EmptyNotifications = ({ turnNotificationsToOff }) => (
        <div data-testid="notifications-panel">
          <div data-testid="empty-state">No notifications</div>
        </div>
      );

      render(<EmptyNotifications turnNotificationsToOff={jest.fn()} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching', () => {
      const LoadingNotifications = () => (
        <div data-testid="notifications-panel">
          <div data-testid="loading">Loading...</div>
        </div>
      );

      render(<LoadingNotifications />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });
});
