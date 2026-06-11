import { getCurrentIssue } from "@/lib/issue-store";

export async function GET() {
  try {
    const issue = getCurrentIssue();
    return Response.json(issue);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load current issue";
    return Response.json({ error: message }, { status: 500 });
  }
}
