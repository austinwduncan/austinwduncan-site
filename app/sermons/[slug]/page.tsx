import type { Metadata } from "next";
import PiecePage, { pieceMetadata } from "@/components/catalog/PiecePage";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return pieceMetadata(slug);
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  return <PiecePage slug={slug} category="sermon" />;
}
