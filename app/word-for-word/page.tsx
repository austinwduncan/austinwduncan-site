import type { Metadata } from "next";
import CategoryList from "@/components/bright/CategoryList";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Word for Word",
  description: "Short answers to real questions about the Bible, theology and the Christian life.",
};

export default function Page() {
  return <CategoryList category="episode" title="Word for Word" countLabel="questions answered" />;
}
