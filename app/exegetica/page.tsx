import type { Metadata } from "next";
import CategoryList from "@/components/bright/CategoryList";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Exegetica",
  description: "Scholarly papers on exegesis, biblical languages and the history of interpretation.",
};

export default function Page() {
  return <CategoryList category="paper" title="Exegetica" countLabel="papers" />;
}
