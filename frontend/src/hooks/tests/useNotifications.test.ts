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
