import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, conversationsTable, messagesTable, usersTable, listingsTable } from "@workspace/db";
import {
  GetMessagesParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CURRENT_USER_ID = 1;

router.get("/messages", async (_req, res): Promise<void> => {
  const convos = await db.select().from(conversationsTable)
    .where(eq(conversationsTable.buyerId, CURRENT_USER_ID))
    .orderBy(desc(conversationsTable.lastMessageAt));

  const enriched = await Promise.all(convos.map(async (c) => {
    const otherPartyId = c.buyerId === CURRENT_USER_ID ? c.sellerId : c.buyerId;
    const [other] = await db.select().from(usersTable).where(eq(usersTable.id, otherPartyId));
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, c.listingId));
    return {
      id: c.id,
      otherPartyName: other?.name ?? "Unknown",
      otherPartyUsername: other?.username ?? "unknown",
      otherPartyAvatar: other?.avatar ?? null,
      listingTitle: listing?.title ?? "Unknown listing",
      listingImage: (listing?.images ?? [])[0] ?? null,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt.toISOString(),
      unreadCount: c.unreadCount,
    };
  }));
  res.json(enriched);
});

router.get("/messages/:conversationId", async (req, res): Promise<void> => {
  const params = GetMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const msgs = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.conversationId))
    .orderBy(desc(messagesTable.createdAt));

  const enriched = await Promise.all(msgs.map(async (m) => {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, m.senderId));
    return {
      ...m,
      senderUsername: sender?.username ?? "unknown",
      isMine: m.senderId === CURRENT_USER_ID,
      createdAt: m.createdAt.toISOString(),
    };
  }));
  res.json(enriched);
});

router.post("/messages/:conversationId", async (req, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [msg] = await db.insert(messagesTable).values({
    conversationId: params.data.conversationId,
    senderId: CURRENT_USER_ID,
    content: body.data.content,
  }).returning();

  await db.update(conversationsTable)
    .set({ lastMessage: body.data.content, lastMessageAt: new Date() })
    .where(eq(conversationsTable.id, params.data.conversationId));

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, CURRENT_USER_ID));
  res.status(201).json({
    ...msg,
    senderUsername: sender?.username ?? "unknown",
    isMine: true,
    createdAt: msg.createdAt.toISOString(),
  });
});

export default router;
