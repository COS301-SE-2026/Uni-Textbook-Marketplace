import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationDropdown } from '../NotificationDropdown';
import * as notificationRoutes from '@/utils/notificationRoutes';




jest.mock('next/link', () => {
  return ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick} data-testid="mock-link">
      {children}
    </a>
  );
});


jest.mock('lucide-react', () => ({
  CheckCheck: ({ className, ...props }: { className?: string }) => (
    <svg data-testid="check-check-icon" className={className} {...props}>
      <title>Check Check</title>
    </svg>
  ),
  Bell: () => <svg data-testid="bell-icon" />,
  MessageCircle: () => <svg data-testid="message-icon" />,
  BookOpen: () => <svg data-testid="book-icon" />,
  AlertCircle: () => <svg data-testid="alert-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  XCircle: () => <svg data-testid="x-circle-icon" />,
  User: () => <svg data-testid="user-icon" />,
  ShoppingBag: () => <svg data-testid="shopping-icon" />,
}));


jest.mock('@/utils/notificationRoutes', () => ({
  getNotificationIcon: jest.fn(),
  getNotificationRoute: jest.fn(),
}));

const mockGetNotificationIcon = notificationRoutes.getNotificationIcon as jest.MockedFunction<typeof notificationRoutes.getNotificationIcon>;
const mockGetNotificationRoute = notificationRoutes.getNotificationRoute as jest.MockedFunction<typeof notificationRoutes.getNotificationRoute>;

describe('NotificationDropdown', () => {
  const mockOnMarkRead = jest.fn();
  const mockOnMarkAllRead = jest.fn();
  const mockOnNavigate = jest.fn();

  const baseNotification = {
    id: 'notif-1',
    entity_type: 'listing_approved',
    message_info: 'Your listing was approved',
    is_read: false,
    created_at: new Date().toISOString(),
    entity_id: 'listing-123',
  };

  const createNotifications = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      ...baseNotification,
      id: `notif-${i + 1}`,
      message_info: `Notification ${i + 1}`,
      is_read: i % 2 === 0,
      created_at: new Date(Date.now() - i * 60000).toISOString(),
    }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNotificationIcon.mockReturnValue(() => <svg data-testid="mock-icon" />);
    mockGetNotificationRoute.mockReturnValue('/notifications/1');
  });

  describe('rendering', () => {
    it('renders the dropdown with title', () => {
      render(
        <NotificationDropdown
          notifications={[]}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <NotificationDropdown
          notifications={[]}
          isLoading={true}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
    });

    it('shows empty state when no notifications', () => {
      render(
        <NotificationDropdown
          notifications={[]}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
    });

    it('renders notifications list', () => {
      const notifications = createNotifications(3);
      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Notification 2')).toBeInTheDocument();
      expect(screen.getByText('Notification 3')).toBeInTheDocument();
    });

    it('limits visible notifications to VISIBLE_COUNT (6)', () => {
      const notifications = createNotifications(10);
      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      const notificationItems = screen.getAllByText(/Notification \d+/);
      expect(notificationItems).toHaveLength(6);
    });

    it('shows "Mark all read" button when there are unread notifications', () => {
      const notifications = createNotifications(3);
      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('Mark all read')).toBeInTheDocument();
      expect(screen.getByTestId('check-check-icon')).toBeInTheDocument();
    });
  )}