import { categoryFeedResponse } from "@/lib/feed";

export async function GET() {
  return categoryFeedResponse("episode");
}
