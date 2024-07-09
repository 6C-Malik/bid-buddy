"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Knock } from "@knocklabs/node";
import { env } from "@/env";

const knock = new Knock(env.KNOCK_SECRET_KEY);

export async function createBidAction(itemId: number) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be logged in to place a bid");
  }

  if (!session || !session.user || !session.user.id) {
    throw new Error("You must be logged in to place a bid");
  }

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    throw new Error("Item not found");
  }

  const latestBidValue = item.currentBid + item.bidInterval;

  await database.insert(bids).values({
    amout: latestBidValue,
    itemId,
    userId: session.user.id,
    timestamp: new Date(),
  });

  await database
    .update(items)
    .set({
      currentBid: latestBidValue,
    })
    .where(eq(items.id, itemId));

    const currentBids = await database.query.bids.findMany({
      where: eq(bids.itemId, itemId),
      with: {
        user: true,
      },
    })

    const recipients: {
      id: string;
      name: string;
      email: string;
    }[] = [];
    for(const bid of  currentBids) {
      if (
        bid.userId !== userId &&
        !recipients.find((recipient) => recipient.id === bid.userId)
      ) {
        recipients.push({
          id: bid.userId,
          name: bid.user.name ?? "Anonymous",
          email: bid.user.email,
        });
      }
    }
    if(recipients.length >0) {
      await knock.workflows.trigger("user-place-bid", {
        actor: {
          id: userId,
          name: session.user.name ?? "Anonymous",
          email: session.user.email,
          collection: "users",
        },
        recipients,
        data: {
          itemId,
          bidAmount: latestBidValue,
          itemName: item.name,
        },
      });

    }
    // TODO: send notifications to everyone else on this item who has placed a bid
  revalidatePath(`/items/${itemId}`);
}
