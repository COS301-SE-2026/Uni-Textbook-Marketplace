import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from '../NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';




jest.mock('@/hooks/useNotifications');


jest.mock('../NotificationDropdown', () => ({
  NotificationDropdown: jest.fn(({ notifications, isLoading, onMarkRead, onMarkAllRead, onNavigate }) => (
    <div data-testid="notification-dropdown">
      <span data-testid="dropdown-notifications-count">{notifications?.length ?? 0}</span>
      <span data-testid="dropdown-loading">{isLoading ? 'loading' : 'ready'}</span>
      <button data-testid="mark-read-btn" onClick={() => onMarkRead('test-id')}>
        Mark Read
      </button>
      <button data-testid="mark-all-read-btn" onClick={onMarkAllRead}>
        Mark All Read
      </button>
      <button data-testid="navigate-btn" onClick={onNavigate}>
        Navigate
      </button>
    </div>
  )),
}));

const mockUseNotifications = useNotifications as jest.MockedFunction<typeof useNotifications>;


