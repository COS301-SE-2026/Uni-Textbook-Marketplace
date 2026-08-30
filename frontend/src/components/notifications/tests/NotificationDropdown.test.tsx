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
  
    it('hides "Mark all read" button when all notifications are read', () => {
      const notifications = createNotifications(3).map(n => ({ ...n, is_read: true }));
      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    });

    it('renders "View All" link', () => {
      render(
        <NotificationDropdown
          notifications={[]}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('View All')).toBeInTheDocument();
      const link = screen.getByTestId('mock-link');
      expect(link).toHaveAttribute('href', '/notifications');
    });
  });

  describe('time formatting', () => {
    it('shows "just now" for notifications less than 1 minute old', () => {
      const notification = {
        ...baseNotification,
        created_at: new Date().toISOString(),
      };

      render(
        <NotificationDropdown
          notifications={[notification]}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('just now')).toBeInTheDocument();
    });

    it('shows "Xm ago" for notifications less than 1 hour old', () => {
      const notification = {
        ...baseNotification,
        created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      };

      render(
        <NotificationDropdown
          notifications={[notification]}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('30m ago')).toBeInTheDocument();
    });

    it('shows "Xh ago" for notifications less than 24 hours old', () => {
      const notification = {
        ...baseNotification,
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      };

      render(
        <NotificationDropdown
          notifications={[notification]}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('5h ago')).toBeInTheDocument();
    });

    it('shows "Xd ago" for notifications older than 24 hours', () => {
      const notification = {
        ...baseNotification,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      };

      render(
        <NotificationDropdown
          notifications={[notification]}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('3d ago')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls onMarkRead when clicking an unread notification', async () => {
      const user = userEvent.setup();
      const notifications = [
        { ...baseNotification, id: 'notif-1', is_read: false },
        { ...baseNotification, id: 'notif-2', is_read: true },
      ];

      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      const links = screen.getAllByTestId('mock-link');
      await user.click(links[0]); 

      expect(mockOnMarkRead).toHaveBeenCalledWith('notif-1');
      expect(mockOnNavigate).toHaveBeenCalled();
    });

    it('does not call onMarkRead when clicking a read notification', async () => {
      const user = userEvent.setup();
      const notifications = [
        { ...baseNotification, id: 'notif-1', is_read: true },
      ];

      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      const link = screen.getByTestId('mock-link');
      await user.click(link);

      expect(mockOnMarkRead).not.toHaveBeenCalled();
      expect(mockOnNavigate).toHaveBeenCalled();
    });

    it('calls onMarkAllRead when clicking "Mark all read" button', async () => {
      const user = userEvent.setup();
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

      const markAllButton = screen.getByText('Mark all read');
      await user.click(markAllButton);

      expect(mockOnMarkAllRead).toHaveBeenCalled();
    });

    it('calls onNavigate when clicking "View All" link', async () => {
      const user = userEvent.setup();

      render(
        <NotificationDropdown
          notifications={[]}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      const viewAllLink = screen.getByText('View All');
      await user.click(viewAllLink);

      expect(mockOnNavigate).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('applies unread styling to unread notifications', () => {
      const notifications = [
        { ...baseNotification, id: 'notif-1', is_read: false },
        { ...baseNotification, id: 'notif-2', is_read: true },
      ];

      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      const links = screen.getAllByTestId('mock-link');
      expect(links[0]).toHaveClass('bg-[#00B4D8]/[0.08]');
      expect(links[1]).not.toHaveClass('bg-[#00B4D8]/[0.08]');
    });

    it('shows unread dot for unread notifications', () => {
      const notifications = [
        { ...baseNotification, id: 'notif-1', is_read: false },
        { ...baseNotification, id: 'notif-2', is_read: true },
      ];

      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      const dots = screen.getAllByTestId('mock-link').filter(el => 
        el.querySelector('.rounded-full.bg-[#00B4D8]')
      );
      expect(dots.length).toBe(1);
    });

    it('applies hover styles to notification items', () => {
      const notifications = createNotifications(1);

      render(
        <NotificationDropdown
          notifications={notifications}
          isLoading={false}
          onMarkRead={mockOnMarkRead}
          onMarkAllRead={mockOnMarkAllRead}
          onNavigate={mockOnNavigate}
        />
      );

      const link = screen.getByTestId('mock-link');
      expect(link).toHaveClass('hover:bg-[#F5F5F5]');
      expect(link).toHaveClass('dark:hover:bg-gray-800');
    });
  });
