import { redirect } from "next/navigation";

/** 예전 미리보기 URL — Atlas는 홈(/)에 통합됨. */
export default function AtlasPreviewRedirectPage() {
  redirect("/");
}
