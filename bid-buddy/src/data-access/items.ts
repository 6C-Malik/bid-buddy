import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { items } from "@/db/schema";

export async function getItem(itemId: number) {
  const item = await database.query.items.findFirst({
    where: eq(items.id,itemId),
  });
  return item;
}
