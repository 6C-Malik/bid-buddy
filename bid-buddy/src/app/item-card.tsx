import { Button } from "@/components/ui/button";
import { Item } from "@/db/schema";
import { formatToDollars } from "@/util/currency";
import getImageUrl from "@/util/files";
import Image from "next/image";
import Link from "next/link";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div key={item.id} className="border p-8 rounded-xl space-y-2 max-h-96">
      <Image
        src={getImageUrl(item.fileKey)}
        alt={item.name}
        width={200}
        height={200}
      />
      <h2 className="text-xl font-bold">{item.name}</h2>
      <p className="text-lg">
        starting price: ${formatToDollars(item.startingPrice)}
      </p>

      <Button asChild>
        <Link href={`/items/${item.id}`}>Place Bid</Link>
      </Button>
    </div>
  );
}
