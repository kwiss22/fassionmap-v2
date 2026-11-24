import { redirect } from "next/navigation";

/** 검색을 메인 진입점으로 — Feed/Atlas/Style Lab/Profile은 유지하되 뒷단으로 뺀다. */
export default function Home() {
  redirect("/search");
}
