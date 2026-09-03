import {
  getNotificationHeading,
  getNotificationIcon,
  getNotificationRoute,
} from '../notificationRoutes';
import { CheckCircle2, XCircle, MessageSquare, SquarePen, Bookmark as BellIcon } from 'lucide-react';
import type { Notification } from '@/types/notification';


jest.mock('lucide-react', () => ({

  CheckCircle2: jest.fn(() => 'CheckCircle2'),

  XCircle: jest.fn(() => 'XCircle'),


  MessageSquare: jest.fn(() => 'MessageSquare'),
  SquarePen: jest.fn(() => 'SquarePen'),
  
  Bookmark: jest.fn(() => 'BellIcon'),
}));

describe('notificationRoutes', () => {


  const baseNotification: Notification = {

    id: 'notif-1',
    entity_type: 'APPROVE_LISTING',
    message_info: 'Test notification',


    is_read: false,
    created_at: new Date().toISOString(),
    entity_id: { id: 'listing-123' } as any,
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

  describe('getNotificationRoute', () => {


    const routeCases = [
      ['APPROVED_LISTING', '/listings/listing-123'],
      ['REJECTED_LISTING', '/listings/listing-123'],
      ['Edited listing', '/listings/listing-123'],
      ['message', '/messages'],
      ['UNKNOWN', '/notifications'],
    ];

    routeCases.forEach(([type, expected]) => {

      it(`returns "${expected}" for "${type}"`, () => {


        const notification = { ...baseNotification, entity_type: type as any };

        expect(getNotificationRoute(notification)).toBe(expected);
      });
    });

    it('handles nested entity_id object', () => {

      const notification = {
        ...baseNotification,

        entity_type: 'APPROVED_LISTING' as any,


        entity_id: { id: 'listing-123' } as any,
      };
      expect(getNotificationRoute(notification)).toBe('/listings/listing-123');
    });

    it('handles null entity_id', () => {


      const notification = { 
        ...baseNotification, 


        entity_type: 'APPROVED_LISTING' as any,
        entity_id: null as any ,
    };
      expect(getNotificationRoute(notification)).toBe('/listings/undefined');
    });
  });

  describe('integration', () => {

    it('maps multiple notifications correctly', () => {


      const notifications: Notification[] = [
        { ...baseNotification, entity_type: 'APPROVED_LISTING', entity_id: '123' },
         
        { ...baseNotification, entity_type: 'message', entity_id: '456' },
        { ...baseNotification, entity_type: 'REJECTED_LISTING', entity_id: '789' },
      ];

      notifications.forEach((n) => {
        expect(getNotificationIcon(n.entity_type)).toBeDefined();


        expect(getNotificationRoute(n)).toBeDefined();


        expect(getNotificationHeading(n.entity_type)).toBeDefined();

        
      });
    });

  });
});