import { redirect } from "next/navigation";

/** Make v2.1 IA: Home = Feed */
export default function Home() {
  redirect("/feed");
}
