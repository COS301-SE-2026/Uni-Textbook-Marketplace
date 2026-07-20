import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Listing } from '../database/entities/listing.entity';
import { db } from '../firebase/firebase-admin';

@Injectable()
export class MessagingService {
    constructor(
        @InjectRepository(Listing)
        private readonly listingsRepository: Repository<Listing>,
    ) {}

    async createConversation(
        buyerId: string,
        listingId: string,
    ) {
        const listing = await this.listingsRepository.findOne({
        where: { id: listingId },
        relations: ['seller'],
        });

        if (!listing) {
        throw new NotFoundException('Listing not found.');
        }

        const sellerId = listing.seller.id;

        if (buyerId === sellerId) {
        throw new ForbiddenException(
            'You cannot start a conversation with yourself.',
        );
        }

        const existingConversation = await db
        .collection('conversations')
        .where('buyerId', '==', buyerId)
        .where('sellerId', '==', sellerId)
        .where('listingId', '==', listingId)
        .limit(1)
        .get();

        if (!existingConversation.empty) {
        return {
            conversationId: existingConversation.docs[0].id,
            alreadyExists: true,
        };
        }

        const conversationRef = await db.collection('conversations').add({
        buyerId,
        sellerId,
        listingId,

        createdAt: new Date(),
        updatedAt: new Date(),

        lastMessage: null,
        lastSenderId: null,
        });

        return {
        conversationId: conversationRef.id,
        alreadyExists: false,
        };
    }

    async getMyConversations(userId: string) {
        const buyerSnapshot = await db
        .collection('conversations')
        .where('buyerId', '==', userId)
        .get();

        const sellerSnapshot = await db
        .collection('conversations')
        .where('sellerId', '==', userId)
        .get();

        const conversations = [
        ...buyerSnapshot.docs,
        ...sellerSnapshot.docs,
        ];

        const uniqueConversations = new Map();

        conversations.forEach((doc) => {
        uniqueConversations.set(doc.id, {
            conversationId: doc.id,
            ...doc.data(),
        });
        });

        return Array.from(uniqueConversations.values()).sort(
        (a: any, b: any) => {
            if (!a.updatedAt || !b.updatedAt) {
            return 0;
            }

            return (
            b.updatedAt.toDate().getTime() -
            a.updatedAt.toDate().getTime()
            );
        },
        );
    }

    async getMessages(
        userId: string,
        conversationId: string,
    ) {
        const conversationRef = db
        .collection('conversations')
        .doc(conversationId);

        const conversationSnapshot = await conversationRef.get();

        if (!conversationSnapshot.exists) {
        throw new NotFoundException('Conversation not found.');
        }

        const conversation = conversationSnapshot.data();

        if (
        conversation?.buyerId !== userId &&
        conversation?.sellerId !== userId
        ) {
        throw new ForbiddenException(
            'You are not a participant in this conversation.',
        );
        }

        const messagesSnapshot = await conversationRef
        .collection('messages')
        .orderBy('sentAt', 'asc')
        .get();

        return messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        }));
    }

    async sendMessage(
        userId: string,
        conversationId: string,
        text: string,
    ) {
        const conversationRef = db
        .collection('conversations')
        .doc(conversationId);

        const conversationSnapshot = await conversationRef.get();

        if (!conversationSnapshot.exists) {
        throw new NotFoundException('Conversation not found.');
        }

        const conversation = conversationSnapshot.data();

        if (
        conversation?.buyerId !== userId &&
        conversation?.sellerId !== userId
        ) {
        throw new ForbiddenException(
            'You are not a participant in this conversation.',
        );
        }

        const messageRef = await conversationRef
        .collection('messages')
        .add({
            senderId: userId,
            text,
            sentAt: new Date(),
            read: false,
        });

        await conversationRef.update({
        updatedAt: new Date(),
        lastMessage: text,
        lastSenderId: userId,
        });

        return {
        messageId: messageRef.id,
        message: 'Message sent successfully.',
        };
    }
}