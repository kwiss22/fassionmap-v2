import { redirect } from "next/navigation";

/** 예전 Discover — Brands(/brands)로 통합 */
export default function DiscoverRedirectPage() {
  redirect("/brands");
}
