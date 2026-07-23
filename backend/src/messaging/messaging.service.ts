import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Listing } from '../database/entities/listing.entity';
import { db } from '../firebase/firebase-admin';
import {
    DocumentData,
    Timestamp,
} from 'firebase-admin/firestore';
import { ConversationResponseDto } from './dto/conversation-response.dto';

interface ConversationData {
    buyerId: string;
    sellerId: string;
    listingId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastMessage: string | null;
    lastSenderId: string | null;
}

interface MessageData {
    senderId: string;
    text: string;
    sentAt: Timestamp;
    read: boolean;
}

interface ConversationResponse extends ConversationData {
    conversationId: string;
}
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

    async getMyConversations(userId: string,): Promise<ConversationResponseDto[]> {
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

        const uniqueConversations = new Map<string, ConversationResponseDto>();

        conversations.forEach((doc) => {
        const data = doc.data() as ConversationData;

        uniqueConversations.set(doc.id, {
            conversationId: doc.id,
            ...data,
        });
        });

        return Array.from(uniqueConversations.values()).sort((a, b) => {
        if (!a.updatedAt || !b.updatedAt) {
            return 0;
        }

        return (
            b.updatedAt.toDate().getTime() -
            a.updatedAt.toDate().getTime()
        );
        });
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

        const conversation = conversationSnapshot.data() as
            | ConversationData
            | undefined;

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

        return messagesSnapshot.docs.map((doc) => {
        const data = doc.data() as MessageData;

        return {
            id: doc.id,
            ...data,
        };
        });
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

        const conversation = conversationSnapshot.data() as
            | ConversationData
            | undefined;

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