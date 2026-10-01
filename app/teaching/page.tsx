import { redirect } from "next/navigation";

// Teaching sessions are read through their series, so the list lives at /series.
export default function Page() {
  redirect("/series");
}
