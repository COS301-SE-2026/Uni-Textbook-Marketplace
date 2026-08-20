import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Listing } from '../database/entities/listing.entity';
import { db } from '../firebase/firebase-admin';
import { CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { User } from '../database/entities/users.entity';

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

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingsRepository: Repository<Listing>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createConversation(buyerId: string, listingId: string) {
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

      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),

      lastMessage: null,
      lastSenderId: null,
    });

    return {
      conversationId: conversationRef.id,
      alreadyExists: false,
    };
  }

  async getMyConversations(userId: string): Promise<ConversationResponseDto[]> {
    const conversationsCollection = db.collection(
      'conversations',
    ) as CollectionReference<ConversationData>;

    const buyerSnapshot = await conversationsCollection
      .where('buyerId', '==', userId)
      .get();

    const sellerSnapshot = await conversationsCollection
      .where('sellerId', '==', userId)
      .get();

    const conversations = [...buyerSnapshot.docs, ...sellerSnapshot.docs];

    const result: ConversationResponseDto[] = [];

    for (const doc of conversations) {
      const data = doc.data();

      const listing = await this.listingsRepository.findOne({
        where: {
          id: data.listingId,
        },
        relations: ['seller', 'book'],
      });

      if (!listing) {
        continue;
      }

      const otherUserId =
        userId === data.buyerId ? data.sellerId : data.buyerId;

      let otherUser: User | null = null;

      if (listing.seller.id === otherUserId) {
        otherUser = listing.seller;
      } else {
        otherUser = await this.usersRepository.findOne({
          where: {
            id: otherUserId,
          },
        });
      }

      if (!otherUser) {
        continue;
      }

      result.push({
        conversationId: doc.id,

        buyerId: data.buyerId,

        sellerId: data.sellerId,

        createdAt: data.createdAt,

        updatedAt: data.updatedAt,

        lastMessage: data.lastMessage,

        lastSenderId: data.lastSenderId,

        listing: {
          id: listing.id,

          title: listing.title || listing.book.title,

          photoUrl:
            listing.photo_urls.length > 0 ? listing.photo_urls[0] : null,
        },

        otherUser: {
          id: otherUser.id,

          firstName: otherUser.first_name,

          lastName: otherUser.last_name,
        },
      });
    }

    result.sort(
      (a, b) => b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime(),
    );

    return result;
  }

  async getMessages(userId: string, conversationId: string) {
    const conversationRef = db.collection('conversations').doc(conversationId);

    const conversationSnapshot = await conversationRef.get();

    if (!conversationSnapshot.exists) {
      throw new NotFoundException('Conversation not found.');
    }

    const conversation = conversationSnapshot.data() as
      ConversationData | undefined;

    if (conversation?.buyerId !== userId && conversation?.sellerId !== userId) {
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

  async sendMessage(userId: string, conversationId: string, text: string) {
    const conversationRef = db.collection('conversations').doc(conversationId);

    const conversationSnapshot = await conversationRef.get();

    if (!conversationSnapshot.exists) {
      throw new NotFoundException('Conversation not found.');
    }

    const conversation = conversationSnapshot.data() as
      ConversationData | undefined;

    if (conversation?.buyerId !== userId && conversation?.sellerId !== userId) {
      throw new ForbiddenException(
        'You are not a participant in this conversation.',
      );
    }

    const messageRef = await conversationRef.collection('messages').add({
      senderId: userId,
      text,
      sentAt: Timestamp.now(),
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
