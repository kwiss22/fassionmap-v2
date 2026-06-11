/**
 * 새 매거진 이슈 발행 — mock 또는 gemini.
 *
 *   LLM_PROVIDER=mock npm run publish:issue
 *   LLM_PROVIDER=gemini npm run publish:issue
 *
 * 생성된 JSON을 검토한 뒤 git commit은 수동으로 한다.
 */

process.env.LLM_PROVIDER = process.env.LLM_PROVIDER ?? "mock";

async function main() {
  const publisherModule = await import("../lib/ai/publisher.ts");
  const publishIssue =
    publisherModule.publishIssue ?? publisherModule.default?.publishIssue;

  if (typeof publishIssue !== "function") {
    throw new Error("publishIssue export not found in lib/ai/publisher.ts");
  }

  const { filepath, issue } = await publishIssue({
    locale: "en-US",
    maxSections: 3,
  });

  console.log(`Published issue vol ${issue.vol} → ${filepath}`);
  console.log(JSON.stringify(issue, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
