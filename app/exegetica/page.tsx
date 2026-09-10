import CategoryPage, { categoryMetadata } from "@/components/catalog/CategoryPage";

export const revalidate = 600;
export const metadata = categoryMetadata("paper");

export default function Page() {
  return <CategoryPage category="paper" />;
}
