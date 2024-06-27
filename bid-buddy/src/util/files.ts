import { env } from "@/env";

export default function getImageUrl(fileKey: string) {
  return `${env.NEXT_PUBLIC_BUCKET_URL}/${fileKey}`;
}
