import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import type { Notification } from '@/types/notification';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    entity_type: 'APPROVE_LISTING',
    message_info: 'Your listing was approved',
    is_read: false,
    created_at: new Date().toISOString(),
    entity_id: 'listing-123',
  },
  {
    id: 'notif-2',
    entity_type: 'message',
    message_info: 'New message from Gift',
    is_read: true,
    created_at: new Date().toISOString(),
    entity_id: 'conv-456',
  },
];

const setup = (response: any, ok = true, status = 200) => {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    json: jest.fn().mockResolvedValue(response),
  });
};

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api';
  });

  describe('loading', () => {
    it('fetches and displays notifications', async () => {
      setup(mockNotifications);
      const { result } = renderHook(() => useNotifications());

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.unreadCount).toBe(1);
    });

    it('handles empty response', async () => {
      setup([]);
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });

    it('handles API errors', async () => {
      setup({ message: 'Server error' }, false, 500);
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBe('Failed to load notifications');
    });

    it('handles paginated responses', async () => {
      setup({ items: mockNotifications });
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.notifications).toEqual(mockNotifications);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('actions', () => {
    it('marks a notification as read', async () => {
      setup(mockNotifications);
      mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({}) });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => await result.current.markRead('notif-1'));

      expect(result.current.notifications[0].is_read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/notifications/notif-1/read',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('marks all as read', async () => {
      setup(mockNotifications);
      mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({}) });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => await result.current.markAllRead());

      expect(result.current.notifications.every((n) => n.is_read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('deletes a notification', async () => {
      setup(mockNotifications);
      mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({}) });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => await result.current.deleteNotif('notif-1'));

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/notifications/notif-1/delete',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('refreshes notifications', async () => {
      setup(mockNotifications);
      setup([...mockNotifications, { ...mockNotifications[0], id: 'notif-3' }]);

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => await result.current.refresh());

      expect(result.current.notifications).toHaveLength(3);
    });

    it('handles action errors by refreshing', async () => {
      setup(mockNotifications);
      mockFetch.mockRejectedValueOnce(new Error('Error'));
      mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(mockNotifications) });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => await result.current.markRead('notif-1'));

      // Should attempt to refresh on error
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('polling', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('polls every 15 seconds', async () => {
      setup(mockNotifications);
      setup(mockNotifications);

      renderHook(() => useNotifications());
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

      jest.advanceTimersByTime(15000);
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    });
  });

  describe('unreadCount', () => {
    it('calculates unread count correctly', async () => {
      const mixed = [
        { ...mockNotifications[0], is_read: false },
        { ...mockNotifications[0], id: '3', is_read: false },
        { ...mockNotifications[0], id: '4', is_read: true },
      ];
      setup(mixed);

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.unreadCount).toBe(2);
    });
  });
});