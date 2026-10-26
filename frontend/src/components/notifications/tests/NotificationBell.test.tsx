import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from '../NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';




jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn().mockReturnValue({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  }),
}));


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

describe('NotificationBell', () => {


  const mockMarkRead = jest.fn();
  const mockMarkAllRead = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the bell icon', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const bellButtons = screen.getAllByRole('button', { name: /notifications/i });
      expect(bellButtons.length).toBeGreaterThan(0);


      expect(bellButtons[0].querySelector('svg')).toBeInTheDocument();


    });

    it('renders unread count badge when there are unread notifications', () => {


      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 5,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const badge = screen.getByText('5');

      expect(badge).toBeInTheDocument();


      expect(badge).toHaveClass('bg-[#00B4D8]');
    });

    it('shows "9+" when unread count exceeds 9', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 15,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const badge = screen.getByText('9+');


      expect(badge).toBeInTheDocument();
    });

    it('does not render badge when there are no unread notifications', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const badge = screen.queryByText(/\d/);



      expect(badge).not.toBeInTheDocument();
    });

    it('updates aria-label with unread count', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 3,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const button = screen.getByRole('button');


      expect(button).toHaveAttribute('aria-label', 'Notifications, 3 unread');
    });

    it('uses generic aria-label when no unread notifications', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const button = screen.getByRole('button');


      expect(button).toHaveAttribute('aria-label', 'Notifications');
    });
  });

  describe('interaction', () => {
    it('opens dropdown when bell is clicked', async () => {



      const user = userEvent.setup();
      mockUseNotifications.mockReturnValue({
        notifications: [
          { 
            id: '1', 
            entity_type: 'listing_approved', 
            message_info: 'Listing approved',

            is_read: false,
            created_at: new Date().toISOString(),

            entity_id: 'listing-123',
          },
        ],
        unreadCount: 1,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });


      await user.click(bellButton);


      
      const dropdown = screen.getByTestId('notification-dropdown');



      expect(dropdown).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {


      const user = userEvent.setup();
      mockUseNotifications.mockReturnValue({


        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(
        <div>
          <div data-testid="outside-element">Outside</div>


          <NotificationBell />
        </div>
      );
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });


      await user.click(bellButton);
      
      const dropdown = screen.getByTestId('notification-dropdown');


      expect(dropdown).toBeInTheDocument();
      
      
      const outsideElement = screen.getByTestId('outside-element');


      await user.click(outsideElement);
      
      await waitFor(() => {
        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
      });
    });

    it('does not close dropdown when clicking inside it', async () => {

      const user = userEvent.setup();


      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,


        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });




      await user.click(bellButton);
      
      const dropdown = screen.getByTestId('notification-dropdown');


      await user.click(dropdown);
      
      expect(dropdown).toBeInTheDocument();
    });

    it('toggles dropdown on bell click', async () => {


      const user = userEvent.setup();


      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });
      
      
      await user.click(bellButton);


      expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
      
      
      await user.click(bellButton);
      await waitFor(() => {


        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
      });
    });

    it('passes props correctly to NotificationDropdown', async () => {
      const user = userEvent.setup();


      const mockNotifications = [
        { 
          id: '1', 
          entity_type: 'listing_approved', 
          message_info: 'Listing approved',
          is_read: false,
          created_at: new Date().toISOString(),
          entity_id: 'listing-123',
        },
        { 
          id: '2', 
          entity_type: 'new_message', 
          message_info: 'New message from Gift',
          is_read: true,
          created_at: new Date().toISOString(),
          entity_id: 'conv-456',
        },
      ];

      mockUseNotifications.mockReturnValue({
        notifications: mockNotifications,
        unreadCount: 1,
        isLoading: true,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });


      await user.click(bellButton);
      
      expect(screen.getByTestId('dropdown-notifications-count')).toHaveTextContent('2');


      expect(screen.getByTestId('dropdown-loading')).toHaveTextContent('loading');
    });

    it('calls onNavigate when dropdown triggers navigation', async () => {


      const user = userEvent.setup();


      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });
      await user.click(bellButton);


      
      const navigateBtn = screen.getByTestId('navigate-btn');


      await user.click(navigateBtn);
      
      await waitFor(() => {


        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {


    it('handles loading state in dropdown', async () => {
      const user = userEvent.setup();


      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: true,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });


      await user.click(bellButton);


      
      expect(screen.getByTestId('dropdown-loading')).toHaveTextContent('loading');
    });
  });

  describe('edge cases', () => {
    
    it('handles undefined notifications gracefully', async () => {
      const user = userEvent.setup();
      mockUseNotifications.mockReturnValue({
        notifications: undefined as any,
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });
      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });

      await user.click(bellButton);
      
      expect(screen.getByTestId('dropdown-notifications-count')).toHaveTextContent('0');
    });

    it('applies correct hover styles', () => {

      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });
      render(<NotificationBell />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:text-[#00B4D8]');
      expect(button).toHaveClass('hover:bg-[#F5F5F5]');
    });

    it('handles dark mode classes', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });
      render(<NotificationBell />);
      
      const button = screen.getByRole('button');

      expect(button).toHaveClass('dark:hover:bg-gray-800');
    });
  });

  describe('accessibility', () => {
    it('sets aria-expanded correctly', async () => {
      const user = userEvent.setup();
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(button);


      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('handles keyboard navigation', async () => {

      const user = userEvent.setup();
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
      });

      render(<NotificationBell />);
      
      const button = screen.getByRole('button');
      
      await user.tab();



      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');


      expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
      
      await user.keyboard('{Enter}');


      await waitFor(() => {
        
        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();

        
      });
    });
  });
});
    

