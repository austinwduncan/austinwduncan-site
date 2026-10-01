import type { Metadata } from "next";
import CategoryList from "@/components/bright/CategoryList";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Forum & Pulpit",
  description: "Cultural commentary and pastoral response to the moment, from Scripture.",
};

export default function Page() {
  return <CategoryList category="commentary" title="Forum & Pulpit" countLabel="pieces" />;
}
