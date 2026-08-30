import {
  getNotificationHeading,
  getNotificationIcon,
  
} from '../notificationRoutes';
import { CheckCircle2, XCircle, MessageSquare, SquarePen, Bell as BellIcon } from 'lucide-react';
import type { Notification } from '@/types/notification';

jest.mock('lucide-react', () => ({
  CheckCircle2: jest.fn(() => 'CheckCircle2'),
  XCircle: jest.fn(() => 'XCircle'),
  MessageSquare: jest.fn(() => 'MessageSquare'),
  SquarePen: jest.fn(() => 'SquarePen'),
  Bell: jest.fn(() => 'BellIcon'),
}));

describe('notificationRoutes', () => {
  const baseNotification: Notification = {
    id: 'notif-1',
    entity_type: 'APPROVE_LISTING',
    message_info: 'Test notification',
    is_read: false,
    created_at: new Date().toISOString(),
    entity_id: 'listing-123',
  };

  describe('getNotificationHeading', () => {
    const cases = [
      ['APPROVE_LISTING', 'Listing Approved'],
      ['REJECT_LISTING', 'Listing Rejected'],
      ['message', 'New Message'],
      ['Edited listing', 'Listing Edited'],
      ['UNKNOWN', 'Notification'],
      ['', 'Notification'],
    ];

    cases.forEach(([input, expected]) => {
      it(`returns "${expected}" for "${input}"`, () => {
        expect(getNotificationHeading(input)).toBe(expected);
      });
    });

    it('handles undefined', () => {
      expect(getNotificationHeading(undefined as any)).toBe('Notification');
    });
  });

  describe('getNotificationIcon', () => {
    const cases = [
      ['APPROVE_LISTING', CheckCircle2],
      ['REJECT_LISTING', XCircle],
      ['message', MessageSquare],
      ['Edited listing', SquarePen],
      ['UNKNOWN', BellIcon],
      ['', BellIcon],
    ];

    cases.forEach(([input, expected]) => {
      it(`returns ${expected.name || 'BellIcon'} for "${input}"`, () => {
        expect(getNotificationIcon(input)).toBe(expected);
      });
    });

    it('handles undefined', () => {
      expect(getNotificationIcon(undefined as any)).toBe(BellIcon);
    });
  });