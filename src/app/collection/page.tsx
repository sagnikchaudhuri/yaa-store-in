import { redirect } from "next/navigation";

// Redirect /collection → /collections (the canonical plural route)
export default function CollectionRedirect() {
  redirect("/collections");
}
