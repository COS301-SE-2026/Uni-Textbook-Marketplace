import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { MessagingService } from '../src/messaging/messaging.service';
import { Listing } from '../src/database/entities/listing.entity';
import { User } from '../src/database/entities/users.entity';

jest.mock('../src/firebase/firebase-admin', () => ({
    db: {
        collection: jest.fn(),
    },
}));

import { db } from '../src/firebase/firebase-admin';

describe('MessagingService', () => {
    let service: MessagingService;
    let listingsRepository: { findOne: jest.Mock };
    let usersRepository: { findOne: jest.Mock };

    let conversationsRef: {
        where: jest.Mock;
        limit: jest.Mock;
        get: jest.Mock;
        add: jest.Mock;
        doc: jest.Mock;
    };

    let conversationDocRef: {
        get: jest.Mock;
        update: jest.Mock;
        collection: jest.Mock;
    };

    let messagesRef: {
        add: jest.Mock;
        orderBy: jest.Mock;
        get: jest.Mock;
    };

    const BUYER_ID = 'buyer-id';
    const SELLER_ID = 'seller-id';
    const STRANGER_ID = 'stranger-id';
    const LISTING_ID = 'listing-id';
    const CONVERSATION_ID = 'conversation-id';

    const buildListing = (overrides: Partial<Listing> = {}): Listing =>
        ({
            id: LISTING_ID,
            title: 'A Textbook',
            photo_urls: [],
            seller: { id: SELLER_ID, first_name: 'Jon', last_name: 'Seller' },
            book: { title: 'A Textbook (book title)' },
            ...overrides,
        }) as unknown as Listing;

    const buildUser = (overrides: Partial<User> = {}): User =>
        ({
            id: BUYER_ID,
            first_name: 'Jane',
            last_name: 'Buyer',
            ...overrides,
        }) as unknown as User;

    beforeEach(async () => {
        conversationsRef = {
            where: jest.fn(),
            limit: jest.fn(),
            get: jest.fn(),
            add: jest.fn(),
            doc: jest.fn(),
        };
        conversationsRef.where.mockReturnValue(conversationsRef);
        conversationsRef.limit.mockReturnValue(conversationsRef);

        conversationDocRef = {
            get: jest.fn(),
            update: jest.fn(),
            collection: jest.fn(),
        };
        conversationsRef.doc.mockReturnValue(conversationDocRef);

        messagesRef = {
            add: jest.fn(),
            orderBy: jest.fn(),
            get: jest.fn(),
        };
        messagesRef.orderBy.mockReturnValue(messagesRef);
        conversationDocRef.collection.mockReturnValue(messagesRef);

        (db.collection as jest.Mock).mockReturnValue(conversationsRef);

        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                MessagingService,
                {
                    provide: getRepositoryToken(Listing),
                    useValue: { findOne: jest.fn() },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: { findOne: jest.fn() },
                },
            ],
        }).compile();

        service = moduleRef.get(MessagingService);
        listingsRepository = moduleRef.get(getRepositoryToken(Listing));
        usersRepository = moduleRef.get(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createConversation', () => {
        it('throws NotFoundException when the listing does not exist', async () => {
            listingsRepository.findOne.mockResolvedValue(null);

            await expect(
                service.createConversation(BUYER_ID, LISTING_ID),
            ).rejects.toThrow(NotFoundException);
        });

        it('throws ForbiddenException when the buyer is the seller', async () => {
            listingsRepository.findOne.mockResolvedValue(
                buildListing({ seller: { id: BUYER_ID } as User }),
            );

            await expect(
                service.createConversation(BUYER_ID, LISTING_ID),
            ).rejects.toThrow(ForbiddenException);
        });

        it('returns the existing conversation when one already exists', async () => {
            listingsRepository.findOne.mockResolvedValue(buildListing());
            conversationsRef.get.mockResolvedValue({
                empty: false,
                docs: [{ id: CONVERSATION_ID }],
            });

            const result = await service.createConversation(
                BUYER_ID,
                LISTING_ID,
            );

            expect(result).toEqual({
                conversationId: CONVERSATION_ID,
                alreadyExists: true,
            });
            expect(conversationsRef.add).not.toHaveBeenCalled();
        });

        it('creates a new conversation when none exists', async () => {
            listingsRepository.findOne.mockResolvedValue(buildListing());
            conversationsRef.get.mockResolvedValue({ empty: true, docs: [] });
            conversationsRef.add.mockResolvedValue({ id: CONVERSATION_ID });

            const result = await service.createConversation(
                BUYER_ID,
                LISTING_ID,
            );

            expect(result).toEqual({
                conversationId: CONVERSATION_ID,
                alreadyExists: false,
            });
            expect(conversationsRef.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    buyerId: BUYER_ID,
                    sellerId: SELLER_ID,
                    listingId: LISTING_ID,
                    lastMessage: null,
                    lastSenderId: null,
                }),
            );
        });
    });

    describe('getMyConversations', () => {
        const conversationDoc = (overrides: Record<string, unknown> = {}) => ({
            id: CONVERSATION_ID,
            data: () => ({
                buyerId: BUYER_ID,
                sellerId: SELLER_ID,
                listingId: LISTING_ID,
                createdAt: { toDate: () => new Date('2026-01-01') },
                updatedAt: { toDate: () => new Date('2026-01-02') },
                lastMessage: 'Hi',
                lastSenderId: BUYER_ID,
                ...overrides,
            }),
        });

        it("maps the seller straight from the listing when they're the other party", async () => {
            conversationsRef.get
                .mockResolvedValueOnce({ docs: [conversationDoc()] }) // buyer query
                .mockResolvedValueOnce({ docs: [] }); // seller query

            listingsRepository.findOne.mockResolvedValue(buildListing());

            const result = await service.getMyConversations(BUYER_ID);

            expect(result).toHaveLength(1);
            expect(result[0].otherUser).toEqual({
                id: SELLER_ID,
                firstName: 'Jon',
                lastName: 'Seller',
            });
            expect(usersRepository.findOne).not.toHaveBeenCalled();
        });

        it('falls back to the users repository when the other party is not the seller', async () => {
            conversationsRef.get
                .mockResolvedValueOnce({ docs: [] }) // buyer query
                .mockResolvedValueOnce({ docs: [conversationDoc()] }); // seller query

            listingsRepository.findOne.mockResolvedValue(buildListing());
            usersRepository.findOne.mockResolvedValue(
                buildUser({ id: BUYER_ID, first_name: 'Jane', last_name: 'Buyer' }),
            );

            const result = await service.getMyConversations(SELLER_ID);

            expect(result).toHaveLength(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: BUYER_ID } }),
            );
            expect(result[0].otherUser).toEqual({
                id: BUYER_ID,
                firstName: 'Jane',
                lastName: 'Buyer',
            });
        });

        it('skips conversations whose listing no longer exists', async () => {
            conversationsRef.get
                .mockResolvedValueOnce({ docs: [conversationDoc()] })
                .mockResolvedValueOnce({ docs: [] });

            listingsRepository.findOne.mockResolvedValue(null);

            const result = await service.getMyConversations(BUYER_ID);

            expect(result).toEqual([]);
        });

        it('skips conversations whose other participant no longer exists', async () => {
            conversationsRef.get
                .mockResolvedValueOnce({ docs: [] })
                .mockResolvedValueOnce({ docs: [conversationDoc()] });

            listingsRepository.findOne.mockResolvedValue(buildListing());
            usersRepository.findOne.mockResolvedValue(null);

            const result = await service.getMyConversations(SELLER_ID);

            expect(result).toEqual([]);
        });

        it('sorts conversations by updatedAt, most recent first', async () => {
            const older = conversationDoc({
                updatedAt: { toDate: () => new Date('2026-01-01') },
            });
            const newer = {
                id: 'conversation-2',
                data: () => ({
                    ...older.data(),
                    updatedAt: { toDate: () => new Date('2026-06-01') },
                }),
            };

            conversationsRef.get
                .mockResolvedValueOnce({ docs: [older, newer] })
                .mockResolvedValueOnce({ docs: [] });

            listingsRepository.findOne.mockResolvedValue(buildListing());

            const result = await service.getMyConversations(BUYER_ID);

            expect(result.map((c) => c.conversationId)).toEqual([
                'conversation-2',
                CONVERSATION_ID,
            ]);
        });
    });

    describe('getMessages', () => {
        it('throws NotFoundException when the conversation does not exist', async () => {
            conversationDocRef.get.mockResolvedValue({ exists: false });

            await expect(
                service.getMessages(BUYER_ID, CONVERSATION_ID),
            ).rejects.toThrow(NotFoundException);
        });

        it('throws ForbiddenException when the user is not a participant', async () => {
            conversationDocRef.get.mockResolvedValue({
                exists: true,
                data: () => ({ buyerId: BUYER_ID, sellerId: SELLER_ID }),
            });

            await expect(
                service.getMessages(STRANGER_ID, CONVERSATION_ID),
            ).rejects.toThrow(ForbiddenException);
        });

        it('returns messages ordered oldest to newest', async () => {
            conversationDocRef.get.mockResolvedValue({
                exists: true,
                data: () => ({ buyerId: BUYER_ID, sellerId: SELLER_ID }),
            });
            messagesRef.get.mockResolvedValue({
                docs: [
                    {
                        id: 'msg-1',
                        data: () => ({
                            senderId: BUYER_ID,
                            text: 'Hello seller!',
                            sentAt: { seconds: 1 },
                            read: false,
                        }),
                    },
                ],
            });

            const result = await service.getMessages(
                BUYER_ID,
                CONVERSATION_ID,
            );

            expect(messagesRef.orderBy).toHaveBeenCalledWith('sentAt', 'asc');
            expect(result).toEqual([
                {
                    id: 'msg-1',
                    senderId: BUYER_ID,
                    text: 'Hello seller!',
                    sentAt: { seconds: 1 },
                    read: false,
                },
            ]);
        });
    });

    describe('sendMessage', () => {
        it('throws NotFoundException when the conversation does not exist', async () => {
            conversationDocRef.get.mockResolvedValue({ exists: false });

            await expect(
                service.sendMessage(BUYER_ID, CONVERSATION_ID, 'Hi'),
            ).rejects.toThrow(NotFoundException);
        });

        it('throws ForbiddenException when the sender is not a participant', async () => {
            conversationDocRef.get.mockResolvedValue({
                exists: true,
                data: () => ({ buyerId: BUYER_ID, sellerId: SELLER_ID }),
            });

            await expect(
                service.sendMessage(STRANGER_ID, CONVERSATION_ID, 'Hi'),
            ).rejects.toThrow(ForbiddenException);
        });

        it('adds the message and updates the conversation summary', async () => {
            conversationDocRef.get.mockResolvedValue({
                exists: true,
                data: () => ({ buyerId: BUYER_ID, sellerId: SELLER_ID }),
            });
            messagesRef.add.mockResolvedValue({ id: 'msg-1' });

            const result = await service.sendMessage(
                BUYER_ID,
                CONVERSATION_ID,
                'Hello seller!',
            );

            expect(messagesRef.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    senderId: BUYER_ID,
                    text: 'Hello seller!',
                    read: false,
                }),
            );
            expect(conversationDocRef.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    lastMessage: 'Hello seller!',
                    lastSenderId: BUYER_ID,
                }),
            );
            expect(result).toEqual({
                messageId: 'msg-1',
                message: 'Message sent successfully.',
            });
        });
    });
});
